<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Officer\StoreTaskRequest;
use App\Http\Requests\Officer\UpdateTaskStatusRequest;
use App\Models\AuditLog;
use App\Models\Committee;
use App\Models\FeedItem;
use App\Models\Task;
use App\Notifications\TaskAssigned;
use App\Notifications\TaskStatusUpdated as TaskStatusNotification;
use App\Support\OfficerScope;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TaskBoardController extends Controller
{
    /**
     * The Figma board is one board across every committee the officer can see, with a
     * committee tag on each card - not one page per committee. Organization leaders see
     * their own board; SSC leadership sees all organizations.
     */
    public function overview(Request $request): Response
    {
        $user = OfficerScope::user($request->user());
        $officer = OfficerScope::profile($user);
        $orgIds = $officer->visibleOrganizationIds();

        foreach ($orgIds as $organizationId) {
            if (! Committee::query()->where('organization_id', $organizationId)->exists()) {
                Committee::firstOrCreate(['organization_id' => $organizationId, 'name' => 'General Tasks']);
            }
        }

        $committees = Committee::query()->whereIn('organization_id', $orgIds)
            ->with('organization:id,name')->get(['id', 'name', 'organization_id'])
            ->map(fn (Committee $committee) => [
                'id' => $committee->id, 'name' => $committee->name,
                'organization_id' => $committee->organization_id,
                'organization' => $committee->organization?->name,
            ]);

        $tasks = Task::query()->where(function ($query) use ($committees, $user): void {
            $query->whereIn('committee_id', $committees->pluck('id'))
                ->orWhere('assigned_to', $user->id);
        })->with(['committee:id,name,organization_id', 'committee.organization:id,name', 'assignee:id,name', 'parentTask:id,title', 'followUpTasks:id,parent_task_id,title,status'])
            ->orderBy('due_date')->get();
        $followUpParents = Task::query()->where('assigned_to', $user->id)
            ->whereHas('committee.organization', fn ($query) => $query->where('is_council', true))
            ->whereHas('committee', fn ($query) => $query->where('organization_id', '!=', $officer->organization_id))
            ->get(['id', 'title']);
        $taskHistory = AuditLog::query()->with('actor')
            ->where('subject_type', Task::class)
            ->whereIn('action', ['task.completed', 'task.deleted', 'task.restored'])
            ->whereIn('organization_id', $orgIds)
            ->latest('created_at')->limit(20)->get()
            ->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => match ($log->action) {
                    'task.completed' => 'completed',
                    'task.restored' => 'restored',
                    default => 'deleted',
                },
                'title' => $log->metadata['title'] ?? 'Task',
                'actor' => $log->actorName() ?? 'Officer',
                'date' => $log->created_at?->diffForHumans(),
                'can_restore' => $log->action === 'task.deleted'
                    && isset($log->metadata['snapshot']['committee_id'])
                    && ! isset($log->metadata['restored_task_id']),
            ]);

        return Inertia::render('officer/board/index', [
            'columns' => collect(Task::STATUSES)->mapWithKeys(fn ($s) => [
                $s => $tasks->where('status', $s)->values()->map(fn (Task $t) => [
                    'id' => $t->id, 'title' => $t->title, 'status' => $t->status,
                    'priority' => $t->priority, 'due_date' => $t->due_date?->toDateString(),
                    'committee' => $t->committee?->name,
                    'organization' => $t->committee?->organization?->name,
                    'assignee' => $t->assignee?->only('id', 'name'),
                    'parent_task' => $t->parentTask?->only('id', 'title'),
                    'follow_up_count' => $t->followUpTasks->count(),
                ]),
            ]),
            'committees' => $committees,
            'follow_up_parents' => $followUpParents,
            'task_history' => $taskHistory,
            'can_create_follow_ups' => $officer->isTaskManager() && ! $officer->hasCouncilWideTaskAuthority(),
            // (org, officer) pairs keep the task form scoped to co-officers in each organization.
            'assignees' => DB::table('officers')->join('users', 'users.id', '=', 'officers.user_id')
                    ->whereIn('officers.organization_id', $orgIds)
                    ->get(['users.id', 'users.name', 'officers.organization_id as organization_id'])
                ->merge(DB::table('organization_user')->join('officers', 'officers.user_id', '=', 'organization_user.user_id')
                    ->join('users', 'users.id', '=', 'organization_user.user_id')
                    ->whereIn('organization_user.organization_id', $orgIds)
                    ->get(['users.id', 'users.name', 'organization_user.organization_id as organization_id']))
                ->unique(fn ($user) => $user->id.'-'.$user->organization_id)->values(),
            'can_manage_tasks' => $officer->isTaskManager(),
            'task_authority_scope' => $officer->hasCouncilWideTaskAuthority() ? 'all organizations' : 'this organization',
            'viewer_id' => $user->id,
        ]);
    }

    public function store(StoreTaskRequest $request, Committee $committee): RedirectResponse
    {
        $this->authorize('manageBoard', $committee);

        $user = OfficerScope::user($request->user());
        $officer = OfficerScope::profile($user);
        $task = $committee->tasks()->create([
            ...$request->validated(),
            'status' => $request->input('status', 'backlog'),
            'created_by' => $officer->id, // never client-supplied
        ]);

        if ($task->assigned_to && $task->assigned_to !== $user->id) {
            $task->assignee?->notify(new TaskAssigned($task));
        }

        FeedItem::record($user, $committee->organization_id, "created task \"{$task->title}\"");
        AuditLog::create(['actor_type' => $user->getMorphClass(), 'actor_id' => $user->id, 'action' => 'task.created', 'subject_type' => Task::class, 'subject_id' => $task->id, 'organization_id' => $committee->organization_id, 'metadata' => ['title' => $task->title, 'assigned_to' => $task->assigned_to], 'ip_address' => $request->ip()]);

        return back()->with('success', 'Task added to the board.');
    }

    public function updateStatus(UpdateTaskStatusRequest $request, Task $task): RedirectResponse
    {
        $this->authorize('updateStatus', $task);

        $previous = $task->status;
        $task->update(['status' => $request->string('status')->toString()]);
        if ($previous !== 'done' && $task->status === 'done') {
            AuditLog::create(['actor_type' => $request->user()->getMorphClass(), 'actor_id' => $request->user()->id, 'action' => 'task.completed', 'subject_type' => Task::class, 'subject_id' => $task->id, 'organization_id' => $task->committee->organization_id, 'metadata' => ['title' => $task->title], 'ip_address' => $request->ip()]);
        }
        $task->loadMissing('creator.user');
        if ($task->creator?->user && $task->creator->user->id !== $request->user()->id) {
            $task->creator->user->notify(new TaskStatusNotification($task, $previous));
        }
        AuditLog::create(['actor_type' => $request->user()->getMorphClass(), 'actor_id' => $request->user()->id, 'action' => 'task.status_updated', 'subject_type' => Task::class, 'subject_id' => $task->id, 'organization_id' => $task->committee->organization_id, 'metadata' => ['title' => $task->title, 'from' => $previous, 'to' => $task->status], 'ip_address' => $request->ip()]);

        return back();
    }

    public function destroy(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('delete', $task);

        $snapshot = $task->only(['committee_id', 'parent_task_id', 'title', 'description', 'assigned_to', 'status', 'priority', 'due_date']);
        $snapshot['follow_up_task_ids'] = $task->followUpTasks()->pluck('id')->all();
        AuditLog::create(['actor_type' => $request->user()->getMorphClass(), 'actor_id' => $request->user()->id, 'action' => 'task.deleted', 'subject_type' => Task::class, 'subject_id' => $task->id, 'organization_id' => $task->committee->organization_id, 'metadata' => ['title' => $task->title, 'snapshot' => $snapshot], 'ip_address' => $request->ip()]);
        $task->delete();

        return back()->with('success', 'Task deleted and recorded in task history.');
    }

    public function restore(Request $request, AuditLog $auditLog): RedirectResponse
    {
        abort_unless($auditLog->action === 'task.deleted' && $auditLog->subject_type === Task::class, 404);
        abort_if(isset($auditLog->metadata['restored_task_id']), 409, 'This task has already been restored.');

        $snapshot = $auditLog->metadata['snapshot'] ?? null;
        abort_unless(is_array($snapshot), 422, 'This task history entry does not contain restorable task details.');

        $committee = Committee::query()->findOrFail($snapshot['committee_id'] ?? 0);
        abort_unless($auditLog->organization_id === $committee->organization_id, 404);
        $this->authorize('manageBoard', $committee);

        $user = OfficerScope::user($request->user());
        $officer = OfficerScope::profile($user);
        $assignedTo = $snapshot['assigned_to'] ?? null;
        if ($assignedTo && ! DB::table('officers')->where('organization_id', $committee->organization_id)->where('user_id', $assignedTo)->exists()) {
            $assignedTo = null;
        }
        $parentTaskId = $snapshot['parent_task_id'] ?? null;
        if ($parentTaskId && ! Task::query()->whereKey($parentTaskId)->exists()) {
            $parentTaskId = null;
        }

        $task = $committee->tasks()->create([
            'parent_task_id' => $parentTaskId,
            'title' => $snapshot['title'],
            'description' => $snapshot['description'] ?? null,
            'assigned_to' => $assignedTo,
            'status' => in_array($snapshot['status'] ?? null, Task::STATUSES, true) ? $snapshot['status'] : 'backlog',
            'priority' => in_array($snapshot['priority'] ?? null, Task::PRIORITIES, true) ? $snapshot['priority'] : 'medium',
            'due_date' => $snapshot['due_date'] ?? null,
            'created_by' => $officer->id,
        ]);
        if (! empty($snapshot['follow_up_task_ids'])) {
            Task::query()->whereIn('id', $snapshot['follow_up_task_ids'])
                ->whereNull('parent_task_id')->update(['parent_task_id' => $task->id]);
        }

        $auditLog->metadata = [...$auditLog->metadata, 'restored_task_id' => $task->id];
        $auditLog->save();
        AuditLog::create(['actor_type' => $user->getMorphClass(), 'actor_id' => $user->id, 'action' => 'task.restored', 'subject_type' => Task::class, 'subject_id' => $task->id, 'organization_id' => $committee->organization_id, 'metadata' => ['title' => $task->title, 'restored_from' => $auditLog->id], 'ip_address' => $request->ip()]);

        if ($task->assigned_to && $task->assigned_to !== $user->id) {
            $task->assignee?->notify(new TaskAssigned($task));
        }

        return back()->with('success', 'Task restored to the board.');
    }
}
