<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\BudgetPlan;
use App\Models\EventBudgetItem;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $officer = $request->user()->officerProfile;
        // The route already requires an officer profile. Keep the same
        // organization scoping as the officer's other planning pages here;
        // a second position check can reject presidents whose title is stored
        // differently from the dashboard's president-role check.
        abort_unless($officer, 403);

        $items = EventBudgetItem::query()
            ->join('events', 'events.id', '=', 'event_budget_items.event_id')
            ->where(fn ($query) => $query
                ->whereIn('events.organization_id', $officer->visibleOrganizationIds())
                ->orWhereNull('events.organization_id'))
            ->with('event:id,title,organization_id,starts_at')
            ->select('event_budget_items.*')
            ->orderByDesc('event_budget_items.updated_at')
            ->get();

        $allocated = (float) $items->sum(fn ($item) => (float) $item->estimated_cost);
        $spent = (float) $items->sum(fn ($item) => (float) ($item->actual_cost ?? 0));
        $organizationIds = $officer->visibleOrganizationIds();
        $plans = BudgetPlan::query()
            ->whereIn('organization_id', $organizationIds)
            ->with('organization:id,name')
            ->orderByDesc('period_start')
            ->orderByDesc('id')
            ->get();
        $planCategories = $plans->groupBy('category')->map(fn ($categoryPlans, $category) => [
            'category' => $category,
            'amount' => (float) $categoryPlans->sum(fn ($plan) => (float) $plan->amount),
            'plans' => $categoryPlans->count(),
        ])->sortByDesc('amount')->values();
        $firstMonth = now()->startOfMonth()->subMonths(11);
        $trend = collect(range(0, 11))->map(function (int $offset) use ($firstMonth, $plans, $items) {
            $month = $firstMonth->copy()->addMonths($offset);
            $monthPlans = $plans->filter(fn ($plan) => $plan->period_start->format('Y-m') === $month->format('Y-m'));
            $monthItems = $items->filter(fn ($item) => $item->event?->starts_at?->format('Y-m') === $month->format('Y-m'));

            return [
                'key' => $month->format('Y-m'),
                'month' => $month->format('M'),
                'year' => $month->format('Y'),
                'event_allocated' => (float) $monthItems->sum(fn ($item) => (float) $item->estimated_cost),
                'event_spent' => (float) $monthItems->sum(fn ($item) => (float) ($item->actual_cost ?? 0)),
                'plan_allocated' => (float) $monthPlans->sum(fn ($plan) => (float) $plan->amount),
            ];
        })->values();
        $allocationByEvent = $items->groupBy(fn ($item) => $item->event?->title ?? 'Event')
            ->map(fn ($eventItems, $eventTitle) => [
                'event' => $eventTitle,
                'amount' => (float) $eventItems->sum(fn ($item) => (float) $item->estimated_cost),
            ])->sortByDesc('amount')->values();

        return Inertia::render('officer/budget/index', [
            'summary' => [
                'allocated' => $allocated,
                'spent' => $spent,
                'remaining' => max(0, $allocated - $spent),
                'utilized_percent' => $allocated > 0 ? min(100, (int) round($spent / $allocated * 100)) : 0,
                'unreported_count' => $items->whereNull('actual_cost')->count(),
            ],
            'expenses' => $items->take(8)->map(fn ($item) => [
                'id' => $item->id,
                'label' => $item->label,
                'event' => $item->event?->title ?? 'Event',
                'date' => $item->updated_at?->toDateString(),
                'estimated' => (float) $item->estimated_cost,
                'actual' => $item->actual_cost === null ? null : (float) $item->actual_cost,
            ])->values(),
            'event_count' => $items->pluck('event_id')->unique()->count(),
            'plans' => $plans->take(8)->map(fn (BudgetPlan $plan) => [
                'id' => $plan->id,
                'title' => $plan->title,
                'category' => $plan->category,
                'amount' => (float) $plan->amount,
                'period_start' => $plan->period_start->toDateString(),
                'period_end' => $plan->period_end->toDateString(),
                'organization' => $plan->organization?->name,
            ])->values(),
            'plan_analytics' => [
                'total' => (float) $plans->sum(fn ($plan) => (float) $plan->amount),
                'count' => $plans->count(),
                'categories' => $planCategories,
                'trend' => $trend,
                'allocation_by_event' => $allocationByEvent,
            ],
            'organizations' => Organization::query()->whereIn('id', $organizationIds)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $officer = $request->user()->officerProfile;
        abort_unless($officer, 403);

        $organizationIds = $officer->visibleOrganizationIds();
        $data = $request->validate([
            'organization_id' => ['required', 'integer', Rule::in($organizationIds->all())],
            'title' => ['required', 'string', 'max:150'],
            'category' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:9999999999.99'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $plan = BudgetPlan::create([
            ...$data,
            'created_by' => $officer->id,
        ]);

        AuditLog::create([
            'actor_type' => $request->user()->getMorphClass(),
            'actor_id' => $request->user()->id,
            'action' => 'budget.plan_created',
            'subject_type' => BudgetPlan::class,
            'subject_id' => $plan->id,
            'organization_id' => $plan->organization_id,
            'metadata' => ['title' => $plan->title, 'category' => $plan->category, 'amount' => $plan->amount],
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('success', 'Budget plan created.');
    }
}
