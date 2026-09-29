<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Officer\StoreTaskRequest;
use App\Http\Requests\Officer\UpdateTaskStatusRequest;
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
     * committee tag on each card - not one page per committee. Scope again comes from
     * visibleOrganizationIds(): committee officer -> own org, SSC officer -> all.
     */
    public function overview(Request $request): Response
    {
        $officer = $request->user()->officerProfile;
        $orgIds = $officer->visibleOrganizationIds();

        $committees = Committee::query()->whereIn('organization_id', $orgIds)
            ->get(['id', 'name', 'organization_id']);

        $tasks = Task::query()->whereIn('committee_id', $committees->pluck('id'))
            ->with(['committee:id,name', 'assignee:id,name'])->orderBy('due_date')->get();

        return Inertia::render('officer/board/index', [
            'columns' => collect(Task::STATUSES)->mapWithKeys(fn ($s) => [
                $s => $tasks->where('status', $s)->values()->map(fn (Task $t) => [
                    'id' => $t->id, 'title' => $t->title, 'status' => $t->status,
                    'priority' => $t->priority, 'due_date' => $t->due_date?->toDateString(),
                    'committee' => $t->committee?->name,
                    'assignee' => $t->assignee?->only('id', 'name'),
                ]),
            ]),
            'committees' => $committees,
            // (org, user) pairs so the "New Task" form can only offer members of the chosen committee's org
            'assignees' => DB::table('organization_user')
                ->join('users', 'users.id', '=', 'organization_user.user_id')
                ->whereIn('organization_user.organization_id', $orgIds)
                ->get(['users.id', 'users.name', 'organization_user.organization_id']),
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

        return back()->with('success', 'Task added to the board.');
    }

    public function updateStatus(UpdateTaskStatusRequest $request, Task $task): RedirectResponse
    {
        $this->authorize('updateStatus', $task);

        $task->update(['status' => $request->string('status')->toString()]);

        return back();
    }
}
