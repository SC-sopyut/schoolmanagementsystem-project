<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Officer\StoreTaskRequest;
use App\Http\Requests\Officer\UpdateTaskStatusRequest;
use App\Models\AuditLog;
use App\Models\Committee;
use App\Models\FeedItem;
use App\Models\Task;
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
        $officer = $request->user()->officerProfile;
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

        $tasks = Task::query()->whereIn('committee_id', $committees->pluck('id'))
            ->with(['committee:id,name,organization_id', 'committee.organization:id,name', 'assignee:id,name'])->orderBy('due_date')->get();

        return Inertia::render('officer/board/index', [
            'columns' => collect(Task::STATUSES)->mapWithKeys(fn ($s) => [
                $s => $tasks->where('status', $s)->values()->map(fn (Task $t) => [
                    'id' => $t->id, 'title' => $t->title, 'status' => $t->status,
                    'priority' => $t->priority, 'due_date' => $t->due_date?->toDateString(),
                    'committee' => $t->committee?->name,
                    'organization' => $t->committee?->organization?->name,
                    'assignee' => $t->assignee?->only('id', 'name'),
                ]),
            ]),
            'committees' => $committees,
            // (org, user) pairs so the "New Task" form can only offer members of the chosen committee's org
            'assignees' => DB::table('organization_user')
                ->join('users', 'users.id', '=', 'organization_user.user_id')
                ->whereIn('organization_user.organization_id', $orgIds)
                ->get(['users.id', 'users.name', 'organization_user.organization_id'])
                ->merge(DB::table('officers')->join('users', 'users.id', '=', 'officers.user_id')
                    ->whereIn('officers.organization_id', $orgIds)
                    ->get(['users.id', 'users.name', 'officers.organization_id as organization_id']))
                ->unique(fn ($user) => $user->id.'-'.$user->organization_id)->values(),
            'can_manage_tasks' => $request->user()->officerProfile->isTaskManager(),
            'task_authority_scope' => $request->user()->officerProfile->hasCouncilWideTaskAuthority() ? 'all organizations' : 'this organization',
            'viewer_id' => $request->user()->id,
        ]);
    }

    public function store(StoreTaskRequest $request, Committee $committee): RedirectResponse
    {
        $this->authorize('manageBoard', $committee);

        $task = $committee->tasks()->create([
            ...$request->validated(),
            'status' => $request->input('status', 'backlog'),
            'created_by' => $request->user()->officerProfile->id, // never client-supplied
        ]);

        FeedItem::record($request->user(), $committee->organization_id, "created task \"{$task->title}\"");
        AuditLog::create(['actor_type' => $request->user()->getMorphClass(), 'actor_id' => $request->user()->id, 'action' => 'task.created', 'subject_type' => Task::class, 'subject_id' => $task->id, 'organization_id' => $committee->organization_id, 'metadata' => ['title' => $task->title, 'assigned_to' => $task->assigned_to], 'ip_address' => $request->ip()]);

        return back()->with('success', 'Task added to the board.');
    }

    public function updateStatus(UpdateTaskStatusRequest $request, Task $task): RedirectResponse
    {
        $this->authorize('updateStatus', $task);

        $previous = $task->status;
        $task->update(['status' => $request->string('status')->toString()]);
        AuditLog::create(['actor_type' => $request->user()->getMorphClass(), 'actor_id' => $request->user()->id, 'action' => 'task.status_updated', 'subject_type' => Task::class, 'subject_id' => $task->id, 'organization_id' => $task->committee->organization_id, 'metadata' => ['title' => $task->title, 'from' => $previous, 'to' => $task->status], 'ip_address' => $request->ip()]);

        return back();
    }
}
