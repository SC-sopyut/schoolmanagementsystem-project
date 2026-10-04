import CouncilLayout from '@/layouts/council-layout';
import { Field, Modal, btnGhost, btnPrimary, inputCls } from '@/components/council/ui';
import { useForm } from '@inertiajs/react';
import { CalendarDays, ChartNoAxesCombined, CircleDollarSign, ClipboardList, Plus, Wallet } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';

type Expense = { id: number; label: string; event: string; date: string | null; estimated: number; actual: number | null };
type Plan = { id: number; title: string; category: string; amount: number; period_start: string; period_end: string; organization: string | null };
type TrendPoint = { key: string; month: string; year: string; event_allocated: number; event_spent: number; plan_allocated: number };
type CategoryAllocation = { category: string; amount: number; plans: number };
type Organization = { id: number; name: string };
type PlanForm = { organization_id: string; title: string; category: string; amount: string; period_start: string; period_end: string; notes: string };
type TrendPeriod = 'monthly' | 'quarterly' | 'yearly';
type Props = {
    summary: { allocated: number; spent: number; remaining: number; utilized_percent: number; unreported_count: number };
    expenses: Expense[];
    event_count: number;
    plans: Plan[];
    plan_analytics: { total: number; count: number; categories: CategoryAllocation[]; trend: TrendPoint[]; allocation_by_event: { event: string; amount: number }[] };
    organizations: Organization[];
};

const cash = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);
const today = () => new Date().toISOString().slice(0, 10);
const monthEnd = () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 10); };

export default function Budget({ summary, expenses, event_count, plans, plan_analytics, organizations }: Props) {
    const [query, setQuery] = useState('');
    const [planOpen, setPlanOpen] = useState(false);
    const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('monthly');
    const visibleExpenses = useMemo(() => expenses.filter((item) => `${item.label} ${item.event}`.toLowerCase().includes(query.toLowerCase())), [expenses, query]);
    const displayedTrend = useMemo(() => aggregateTrend(plan_analytics.trend, trendPeriod), [plan_analytics.trend, trendPeriod]);
    const maxTrend = Math.max(...displayedTrend.flatMap((item) => [item.event_allocated, item.event_spent, item.plan_allocated]), 1);
    const rankedEvents = plan_analytics.allocation_by_event.filter((item) => item.amount > 0);
    const eventAllocations = [
        ...rankedEvents.slice(0, 4),
        ...(rankedEvents.length > 4 ? [{ event: 'Other events', amount: rankedEvents.slice(4).reduce((sum, item) => sum + item.amount, 0) }] : []),
    ];
    const allocationTotal = eventAllocations.reduce((total, item) => total + item.amount, 0);
    let allocationProgress = 0;
    const donutColors = ['#e94683', '#8252bb', '#25aeca', '#efb936', '#36a269'];
    const donutStops = eventAllocations.map((item, index) => {
        const start = allocationProgress;
        allocationProgress += allocationTotal ? item.amount / allocationTotal * 100 : 0;
        return `${donutColors[index % donutColors.length]} ${start}% ${allocationProgress}%`;
    });
    const donutStyle = { background: donutStops.length ? `conic-gradient(${donutStops.join(', ')})` : 'conic-gradient(#203725 0% 100%)' };
    const form = useForm<PlanForm>({
        organization_id: organizations[0] ? String(organizations[0].id) : '',
        title: '', category: 'Events & programs', amount: '',
        period_start: today(), period_end: monthEnd(), notes: '',
    });

    function createPlan(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/officer/budget', {
            preserveScroll: true,
            onSuccess: () => { setPlanOpen(false); form.reset('title', 'amount', 'notes'); },
        });
    }

    return <CouncilLayout title="Budget">
        <div className="budget-dashboard mx-auto max-w-7xl space-y-5 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">Council finances</p><h1 className="mt-1 text-2xl font-bold text-[#12351f]">Budget</h1><p className="mt-1 text-sm text-[#64806a]">Plan allocations, track event spending, and see where the funds are going.</p></div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setPlanOpen(true)} className={`${btnPrimary} !bg-[#176b35]`}><Plus className="h-4 w-4"/> Add budget plan</button>
                    <a href="/officer/events" className="inline-flex items-center gap-2 rounded-lg border border-[#cfe1ce] bg-white px-4 py-2.5 text-sm font-semibold text-[#245f35] hover:bg-emerald-50"><CalendarDays className="h-4 w-4"/> Plan an event</a>
                </div>
            </div>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Budget summary">
                <Metric tone="pink" label="Budget remaining" value={cash(summary.remaining)} caption={`${cash(summary.allocated)} allocated to events`} icon={Wallet} />
                <Metric tone="purple" label="Budget utilized" value={`${summary.utilized_percent}%`} caption={`${cash(summary.spent)} recorded event spend`} icon={CircleDollarSign} />
                <Metric tone="cyan" label="Planned allocations" value={cash(plan_analytics.total)} caption={`${plan_analytics.count} ${plan_analytics.count === 1 ? 'plan' : 'plans'} across categories`} icon={ChartNoAxesCombined} />
                <Metric tone="orange" label="Needs actual cost" value={String(summary.unreported_count)} caption="Event lines without a recorded actual" icon={ClipboardList} />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.5fr_.8fr]">
                <div className="rounded-2xl border border-[#dce9d8] bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-[#173a22]">Budget analytics</h2><p className="mt-1 text-xs text-[#718574]">Event allocations, recorded spending, and planned funds over time.</p></div><div className="flex rounded-lg bg-[#f0f4ed] p-1">{(['monthly', 'quarterly', 'yearly'] as const).map((period) => <button key={period} type="button" onClick={() => setTrendPeriod(period)} className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold capitalize ${trendPeriod === period ? 'bg-white text-emerald-800 shadow-sm' : 'text-[#718574]'}`}>{period}</button>)}</div></div>
                    <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-[#64806a]"><LegendDot color="#ed4b83" label="Event allocation"/><LegendDot color="#8252bb" label="Actual spend"/><LegendDot color="#25aeca" label="Budget plans"/></div>
                    {displayedTrend.some((item) => item.event_allocated + item.event_spent + item.plan_allocated > 0) ? <TrendChart points={displayedTrend} maxValue={maxTrend}/> : <EmptyChart title="No budget activity in this period" body="Event budgets are plotted by event date; budget plans are plotted by their start date."/>}
                    <p className="mt-3 text-[10px] text-[#718574]">Event amounts use the event start month because individual expense dates are not stored.</p>
                </div>
                <div className="rounded-2xl border border-[#dce9d8] bg-white p-5 shadow-sm">
                    <div className="mb-4"><h2 className="font-bold text-[#173a22]">Allocation by event</h2><p className="mt-1 text-xs text-[#718574]">Share of estimated event budgets.</p></div>
                    {eventAllocations.length ? <><div className="flex justify-center py-2"><div className="grid h-44 w-44 place-items-center rounded-full" style={{ ...donutStyle }} role="img" aria-label={`Estimated event allocations total ${cash(allocationTotal)}`}><div className="grid h-32 w-32 place-content-center rounded-full bg-white text-center"><strong className="text-xl text-[#173a22]">{cash(allocationTotal)}</strong><span className="text-[10px] text-[#718574]">allocated</span></div></div></div><div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">{eventAllocations.map((item, index) => <div key={item.event} className="flex min-w-0 items-center gap-2 text-xs"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: donutColors[index % donutColors.length] }}/><span className="truncate text-[#64806a]" title={item.event}>{item.event}</span><strong className="ml-auto text-[#27412d]">{Math.round(item.amount / allocationTotal * 100)}%</strong></div>)}</div></> : <EmptyChart title="No event allocations yet" body="Add budget lines to events and allocation shares will appear here."/>}
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#dce9d8] bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf2ea] px-5 py-4"><div><h2 className="font-bold text-[#173a22]">Budget plans</h2><p className="mt-1 text-xs text-[#718574]">Planned category allocations for your organization scope.</p></div><button type="button" onClick={() => setPlanOpen(true)} className={btnGhost}><Plus className="h-4 w-4"/> Add plan</button></div>
                {plans.length ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-[#f7faf4] text-[10px] font-bold uppercase tracking-wide text-[#718574]"><tr><th className="px-5 py-3">Plan</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Organization</th><th className="px-5 py-3">Period</th><th className="px-5 py-3 text-right">Allocation</th></tr></thead><tbody className="divide-y divide-[#edf2ea]">{plans.map((plan) => <tr key={plan.id} className="hover:bg-[#fbfdf9]"><td className="px-5 py-3.5 font-semibold text-[#27412d]">{plan.title}</td><td className="px-5 py-3.5 text-[#64806a]">{plan.category}</td><td className="px-5 py-3.5 text-[#64806a]">{plan.organization ?? '—'}</td><td className="px-5 py-3.5 text-[#64806a]">{shortDate(plan.period_start)} – {shortDate(plan.period_end)}</td><td className="px-5 py-3.5 text-right font-semibold">{cash(plan.amount)}</td></tr>)}</tbody></table><div className="border-t border-[#edf2ea] px-5 py-3 text-xs text-[#718574]">Showing {plans.length} most recent plans · {cash(plan_analytics.total)} total planned</div></div> : <EmptyChart title="No budget plans yet" body="Add your first plan to set an allocation by category and time period." action={<button type="button" onClick={() => setPlanOpen(true)} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-800"><Plus className="h-4 w-4"/> Add budget plan</button>} />}
            </section>

            <section className="grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
                <div className="rounded-2xl border border-[#dce9d8] bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between"><h2 className="font-bold text-[#173a22]">Event allocation &amp; spend</h2><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">{event_count} {event_count === 1 ? 'event' : 'events'}</span></div>
                    <div className="flex items-center gap-5"><div className="grid h-32 w-32 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#17632d 0deg ${Math.max(0, 100 - summary.utilized_percent) * 3.6}deg, #efbd3b ${Math.max(0, 100 - summary.utilized_percent) * 3.6}deg 360deg)` }}><div className="grid h-24 w-24 place-content-center rounded-full bg-white text-center"><strong className="text-2xl text-[#163b22]">{Math.max(0, 100 - summary.utilized_percent)}%</strong><span className="text-[10px] text-[#68806b]">remaining</span></div></div><div className="space-y-4 text-sm"><Legend color="bg-[#17632d]" label="Available" value={cash(summary.remaining)}/><Legend color="bg-[#efbd3b]" label="Spent" value={cash(summary.spent)}/></div></div>
                    <p className="mt-5 text-xs leading-relaxed text-[#718574]">These totals are based on event budget lines; planned category allocations above are tracked separately.</p>
                </div>
                <div className="rounded-2xl border border-[#dce9d8] bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-[#173a22]">Recent event budget lines</h2><p className="mt-1 text-xs text-[#718574]">Compare event estimates with recorded actual costs.</p></div><label className="sr-only" htmlFor="budget-search">Search budget lines</label><input id="budget-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search budget lines…" className="w-full rounded-lg border border-[#dce9d8] bg-[#fbfdf9] px-3 py-2 text-sm outline-none focus:border-emerald-600 sm:w-56"/></div>
                    {visibleExpenses.length ? <div className="overflow-x-auto"><table className="w-full min-w-[570px] text-left text-sm"><thead className="bg-[#f7faf4] text-[10px] font-bold uppercase tracking-wide text-[#718574]"><tr><th className="px-3 py-2.5">Budget line</th><th className="px-3 py-2.5">Event</th><th className="px-3 py-2.5 text-right">Estimated</th><th className="px-3 py-2.5 text-right">Actual</th><th className="px-3 py-2.5">Status</th></tr></thead><tbody className="divide-y divide-[#edf2ea]">{visibleExpenses.map((item) => <tr key={item.id} className="hover:bg-[#fbfdf9]"><td className="px-3 py-3 font-semibold text-[#27412d]">{item.label}</td><td className="px-3 py-3 text-[#64806a]">{item.event}</td><td className="px-3 py-3 text-right">{cash(item.estimated)}</td><td className="px-3 py-3 text-right">{item.actual === null ? '—' : cash(item.actual)}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${item.actual === null ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>{item.actual === null ? 'Awaiting actual' : 'Recorded'}</span></td></tr>)}</tbody></table></div> : <p className="py-8 text-center text-sm text-[#718574]">{query ? 'No matching budget lines.' : 'No event budget lines yet.'}</p>}
                </div>
            </section>
        </div>

        <Modal open={planOpen} onClose={() => { setPlanOpen(false); form.clearErrors(); }} title="Add budget plan">
            <form onSubmit={createPlan} className="space-y-4">
                <Field label="Plan name" error={form.errors.title}><input className={inputCls} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} placeholder="e.g. Student welfare fund" required maxLength={150}/></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Category" error={form.errors.category}><select className={inputCls} value={form.data.category} onChange={(e) => form.setData('category', e.target.value)}>{['Events & programs', 'Student welfare', 'Council operations', 'Communications', 'Technology', 'Office expenses', 'Other'].map((category) => <option key={category}>{category}</option>)}</select></Field>
                    <Field label="Allocated amount (PHP)" error={form.errors.amount}><input className={inputCls} type="number" min="0.01" step="0.01" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} placeholder="0.00" required/></Field>
                </div>
                <Field label="Organization" error={form.errors.organization_id}><select className={inputCls} value={form.data.organization_id} onChange={(e) => form.setData('organization_id', e.target.value)} required>{organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}</select></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Period start" error={form.errors.period_start}><input className={inputCls} type="date" value={form.data.period_start} onChange={(e) => form.setData('period_start', e.target.value)} required/></Field>
                    <Field label="Period end" error={form.errors.period_end}><input className={inputCls} type="date" value={form.data.period_end} onChange={(e) => form.setData('period_end', e.target.value)} required/></Field>
                </div>
                <Field label="Notes (optional)" error={form.errors.notes}><textarea className={`${inputCls} min-h-20 resize-y`} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} maxLength={2000} placeholder="Add a short note about this allocation"/></Field>
                {!organizations.length && <p className="text-sm text-red-600">No organizations are available for your account.</p>}
                <div className="flex justify-end gap-2 border-t border-[#edf2ea] pt-4"><button type="button" className={btnGhost} onClick={() => setPlanOpen(false)}>Cancel</button><button type="submit" className={btnPrimary} disabled={form.processing || !organizations.length}><Plus className="h-4 w-4"/>{form.processing ? 'Saving…' : 'Create plan'}</button></div>
            </form>
        </Modal>
    </CouncilLayout>;
}

function Metric({ label, value, caption, icon: Icon, tone }: { label: string; value: string; caption: string; icon: typeof Wallet; tone: 'pink' | 'purple' | 'cyan' | 'orange' }) {
    const colors = {
        pink: 'from-[#d9417d] to-[#eb6594]',
        purple: 'from-[#7650b2] to-[#9569c8]',
        cyan: 'from-[#20a5c5] to-[#46c5d8]',
        orange: 'from-[#ed9634] to-[#f4b342]',
    };
    return <div className={`rounded-2xl border border-white/15 bg-gradient-to-br ${colors[tone]} p-4 text-white shadow-sm`}><div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wide text-white/90">{label}</span><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/20 text-white"><Icon className="h-4 w-4"/></span></div><div className="mt-2 text-2xl font-bold text-white">{value}</div><p className="mt-1 text-xs text-white/85">{caption}</p><div className="mt-3 h-1 rounded-full bg-white/25"><div className="h-full w-1/4 rounded-full bg-white"/></div></div>;
}
function Legend({ color, label, value }: { color: string; label: string; value: string }) { return <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${color}`}/><span className="text-[#718574]">{label}</span><strong className="text-[#27412d]">{value}</strong></div>; }
function LegendDot({ color, label }: { color: string; label: string }) { return <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }}/>{label}</span>; }
function EmptyChart({ title, body, action }: { title: string; body: string; action?: ReactNode }) { return <div className="grid min-h-44 content-center justify-items-center rounded-xl bg-[#f7faf3] px-5 py-8 text-center"><p className="font-semibold text-[#27412d]">{title}</p><p className="mt-1 max-w-xs text-sm text-[#718574]">{body}</p>{action}</div>; }
function shortDate(value: string) { return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }

function aggregateTrend(points: TrendPoint[], period: TrendPeriod) {
    if (period === 'monthly') return points.slice(-6).map((point) => ({ ...point, label: point.month }));

    const groups = new Map<string, TrendPoint & { label: string }>();
    for (const point of points) {
        const date = new Date(`${point.key}-01T00:00:00`);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const key = period === 'yearly' ? point.year : `${point.year}-Q${quarter}`;
        const label = period === 'yearly' ? point.year : `Q${quarter} '${point.year.slice(-2)}`;
        const current = groups.get(key) ?? { key, month: '', year: point.year, label, event_allocated: 0, event_spent: 0, plan_allocated: 0 };
        current.event_allocated += point.event_allocated;
        current.event_spent += point.event_spent;
        current.plan_allocated += point.plan_allocated;
        groups.set(key, current);
    }
    return [...groups.values()];
}

function TrendChart({ points, maxValue }: { points: (TrendPoint & { label: string })[]; maxValue: number }) {
    const left = 50;
    const right = 630;
    const top = 12;
    const bottom = 202;
    const y = (value: number) => bottom - value / maxValue * (bottom - top);
    const x = (index: number) => points.length === 1 ? (left + right) / 2 : left + index / (points.length - 1) * (right - left);
    const path = (pick: (point: TrendPoint) => number) => points.map((point, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(pick(point))}`).join(' ');
    const gridValues = [0, .25, .5, .75, 1];

    return <div className="w-full overflow-hidden" role="img" aria-label="Budget trend chart for event allocation, actual spend, and budget plans">
        <svg viewBox="0 0 650 245" className="h-60 w-full" preserveAspectRatio="none">
            {gridValues.map((fraction) => <g key={fraction}><line x1={left} x2={right} y1={y(maxValue * fraction)} y2={y(maxValue * fraction)} stroke="currentColor" className="text-[#dce9d8]" strokeOpacity=".7" strokeDasharray={fraction === 0 ? undefined : '3 5'}/><text x="2" y={y(maxValue * fraction) + 4} fontSize="10" fill="currentColor" className="text-[#718574]">{cash(maxValue * fraction)}</text></g>)}
            <path d={path((point) => point.event_allocated)} fill="none" stroke="#ed4b83" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d={path((point) => point.event_spent)} fill="none" stroke="#8252bb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d={path((point) => point.plan_allocated)} fill="none" stroke="#25aeca" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            {points.map((point, index) => <g key={point.key}><circle cx={x(index)} cy={y(point.event_allocated)} r="3.5" fill="#ed4b83" stroke="white" strokeWidth="1.5"/><circle cx={x(index)} cy={y(point.event_spent)} r="3.5" fill="#8252bb" stroke="white" strokeWidth="1.5"/><text x={x(index)} y="228" textAnchor="middle" fontSize="10" fill="currentColor" className="text-[#718574]">{point.label}</text></g>)}
        </svg>
    </div>;
}
