<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Concern;
use App\Models\Event;
use App\Models\EventBudgetItem;
use App\Models\FeedItem;
use App\Models\Officer;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * One controller, two dashboards (both from the Figma):
 *  - position = "President"  -> president/dashboard  (concerns, budget, officers, announcements)
 *  - anyone else             -> officer/dashboard    (tasks, concerns, events, members)
 * Scope is identical for both: Officer::visibleOrganizationIds() - the SSC president
 * therefore sees every organization's numbers, a "BYTE President" only BYTE's.
 */
class DashboardController extends Controller
{
    private const OPEN_CONCERN_STATUSES = ['submitted', 'reviewed', 'forwarded'];

    public function __invoke(Request $request): Response
    {
        $officer = $request->user()->officerProfile;
        $orgIds = $officer->visibleOrganizationIds();

        // Events for this officer's scope, plus school-wide (NULL org) events everyone can see.
        $events = Event::query()
            ->where(fn ($q) => $q->whereIn('organization_id', $orgIds)->orWhereNull('organization_id'));

        $upcoming = (clone $events)->where('starts_at', '>=', now())
            ->whereIn('status', ['planned', 'ongoing'])->orderBy('starts_at');

        $concerns = Concern::query()->whereIn('organization_id', $orgIds);

        $common = [
            'label' => $officer->dashboardLabel(),
            'organization' => $officer->organization?->name,
            'today' => now()->toDateString(),
            'upcoming_events' => (clone $upcoming)->with('organization:id,name')->limit(3)->get()
                ->map(fn (Event $e) => [
                    'id' => $e->id, 'title' => $e->title, 'starts_at' => $e->starts_at,
                    'location' => $e->location, 'organization' => $e->organization?->name ?? 'School-wide',
                ]),
            'upcoming_events_count' => (clone $upcoming)->count(),
        ];

        return strcasecmp((string) $officer->position, 'President') === 0
            ? $this->president($officer, $orgIds, $concerns, $common)
            : $this->officer($orgIds, $concerns, $common);
    }

    private function officer($orgIds, $concerns, array $common): Response
    {
        $tasks = Task::query()->whereHas('committee', fn ($q) => $q->whereIn('organization_id', $orgIds));
        $week = now()->subWeek();

        return Inertia::render('officer/dashboard', $common + [
            'stats' => [
                'active_tasks' => (clone $tasks)->where('status', '!=', 'done')->count(),
                'tasks_new_this_week' => (clone $tasks)->where('created_at', '>=', $week)->count(),
                'pending_concerns' => (clone $concerns)->whereIn('status', self::OPEN_CONCERN_STATUSES)->count(),
                'concerns_resolved_this_week' => (clone $concerns)->where('resolved_at', '>=', $week)->count(),
                'members' => DB::table('organization_user')->whereIn('organization_id', $orgIds)
                    ->distinct()->count('user_id'),
                'organizations' => $orgIds->count(),
            ],
            'high_priority_tasks' => (clone $tasks)->where('priority', 'high')
                ->with('committee:id,name')->orderBy('due_date')->limit(4)->get()
                ->map(fn (Task $t) => [
                    'id' => $t->id, 'title' => $t->title, 'status' => $t->status,
                    'due_date' => $t->due_date, 'committee' => $t->committee?->name,
                ]),
            'recent_actions' => $this->feed($orgIds),
        ]);
    }

    private function president(Officer $officer, $orgIds, $concerns, array $common): Response
    {
        $budget = EventBudgetItem::query()
            ->whereHas('event', fn ($q) => $q->whereIn('organization_id', $orgIds));
        $allocated = (float) (clone $budget)->sum('estimated_cost');
        $spent = (float) (clone $budget)->sum('actual_cost');

        return Inertia::render('president/dashboard', $common + [
            'first_name' => strtok(request()->user()->name, ' '),
            'stats' => [
                'open_concerns' => (clone $concerns)->whereIn('status', self::OPEN_CONCERN_STATUSES)->count(),
                'high_priority_concerns' => (clone $concerns)->whereIn('status', self::OPEN_CONCERN_STATUSES)
                    ->where('priority', 'high')->count(),
                'budget_allocated' => $allocated,
                'budget_remaining' => max($allocated - $spent, 0),
                'budget_used_pct' => $allocated > 0 ? (int) round($spent / $allocated * 100) : 0,
                'officers' => Officer::whereIn('organization_id', $orgIds)->count(),
            ],
            // Built through toOfficerArray() so anonymous identities stay hidden here too.
            'recent_concerns' => (clone $concerns)->with(['organization:id,name', 'student:id,name'])
                ->latest()->limit(3)->get()->map->toOfficerArray(),
            'announcements' => Announcement::query()
                ->where(fn ($query) => $query->visibleTo($officer->user)->orWhere('officer_id', $officer->id))
                ->whereNotNull('published_at')
                ->latest('published_at')->limit(2)->get(['id', 'title', 'body', 'published_at']),
        ]);
    }

    private function feed($orgIds)
    {
        return FeedItem::query()
            ->where(fn ($q) => $q->whereIn('organization_id', $orgIds)->orWhereNull('organization_id'))
            ->with('user:id,name')->latest('created_at')->limit(4)->get()
            ->map(fn (FeedItem $f) => [
                'id' => $f->id, 'actor' => $f->user?->name ?? 'System',
                'message' => $f->message, 'created_at' => $f->created_at,
            ]);
    }
}
