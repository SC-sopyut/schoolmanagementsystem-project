<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Officer\StoreBudgetItemRequest;
use App\Http\Requests\Officer\StoreEventRequest;
use App\Models\Election;
use App\Models\Event;
use App\Models\EventChecklistItem;
use App\Models\FeedItem;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EventPlanningController extends Controller
{
    /**
     * "Events & Voting" page. Events = everything in the officer's scope plus school-wide
     * events; `can_manage` is decided by EventPolicy so the UI never offers what the
     * server would refuse. Budget/checklist figures are aggregated in SQL (withSum/withCount),
     * not per-event queries.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $officer = $user->officerProfile;
        $orgIds = $officer->visibleOrganizationIds();

        $events = Event::query()
            ->where(fn ($q) => $q->whereIn('organization_id', $orgIds)->orWhereNull('organization_id'))
            ->with('organization:id,name')
            ->withCount([
                'attendees',
                'checklistItems as checklist_total',
                'checklistItems as checklist_done' => fn ($q) => $q->where('is_done', true),
            ])
            ->withSum('budgetItems as budget_allocated', 'estimated_cost')
            ->withSum('budgetItems as budget_spent', 'actual_cost')
            ->orderBy('starts_at')->get()
            ->map(fn (Event $e) => [
                'id' => $e->id, 'title' => $e->title, 'location' => $e->location,
                'starts_at' => $e->starts_at, 'status' => $e->status,
                'organization' => $e->organization?->name ?? 'School-wide',
                'attendees_count' => $e->attendees_count,
                'budget_allocated' => (float) $e->budget_allocated,
                'budget_spent' => (float) $e->budget_spent,
                'checklist_total' => $e->checklist_total,
                'checklist_done' => $e->checklist_done,
                'can_manage' => $user->can('managePlanning', $e),
            ]);

        return Inertia::render('officer/events/index', [
            'events' => $events,
            'elections' => Election::query()
                ->where(fn ($q) => $q->whereIn('organization_id', $orgIds)->orWhereNull('organization_id'))
                ->with('organization:id,name')->withCount(['candidates', 'votes'])
                ->latest('starts_at')->get()->map(fn (Election $el) => [
                    'id' => $el->id, 'title' => $el->title, 'status' => $el->status,
                    'organization' => $el->organization?->name ?? 'School-wide',
                    'starts_at' => $el->starts_at, 'ends_at' => $el->ends_at,
                    'candidates_count' => $el->candidates_count, 'votes_count' => $el->votes_count,
                ]),
            // Only the orgs this officer may plan for (+ a school-wide option for the council officer).
            'plannable_organizations' => Organization::whereIn('id', $orgIds)->get(['id', 'name']),
            'can_plan_school_wide' => (bool) $officer->organization?->is_council,
        ]);
    }

    /** Event + budget lines + checklist in one transaction (all-or-nothing). */
    public function store(StoreEventRequest $request): RedirectResponse
    {
        $this->authorize('plan', [Event::class, $request->filled('organization_id') ? $request->integer('organization_id') : null]);

        $event = DB::transaction(function () use ($request) {
            $event = Event::create([
                ...$request->safe()->except(['budget_items', 'checklist_items']),
                'created_by' => $request->user()->officerProfile->id,
                'status' => 'planned',
            ]);

            foreach ($request->input('budget_items', []) as $item) {
                $event->budgetItems()->create($item);
            }
            foreach ($request->input('checklist_items', []) as $item) {
                $event->checklistItems()->create($item);
            }

            return $event;
        });

        FeedItem::record($request->user(), $event->organization_id, "planned event \"{$event->title}\"");

        return redirect()->route('officer.events.index')->with('success', 'Event planned.');
    }

    public function storeBudgetItem(StoreBudgetItemRequest $request, Event $event): RedirectResponse
    {
        $this->authorize('managePlanning', $event);
        $event->budgetItems()->create($request->validated());

        return back();
    }

    public function toggleChecklistItem(Event $event, EventChecklistItem $checklistItem): RedirectResponse
    {
        $this->authorize('managePlanning', $event);
        abort_unless($checklistItem->event_id === $event->id, 404);
        $checklistItem->update(['is_done' => ! $checklistItem->is_done]);

        return back();
    }
}
