import CouncilLayout from '@/layouts/council-layout';
import {
    Card,
    Field,
    Modal,
    Pill,
    ProgressBar,
    btnGhost,
    btnPrimary,
    inputCls,
    money,
    shortDate,
    toneFor,
    type Tone,
} from '@/components/council/ui';
import { store as storeEvent } from '@/routes/officer/events';
import { useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MapPin, Plus, Users } from 'lucide-react';
import { useState } from 'react';

type Ev = {
    id: number;
    title: string;
    location: string | null;
    starts_at: string;
    status: string;
    organization: string;
    attendees_count: number;
    budget_allocated: number;
    budget_spent: number;
    checklist_total: number;
    checklist_done: number;
    can_manage: boolean;
};
type Election = {
    id: number;
    title: string;
    status: string;
    organization: string;
    starts_at: string;
    ends_at: string;
    candidates_count: number;
    votes_count: number;
};
type Props = {
    events: Ev[];
    elections: Election[];
    plannable_organizations: { id: number; name: string }[];
    can_plan_school_wide: boolean;
};
type EventForm = {
    organization_id: string; title: string; description: string; location: string;
    starts_at: string; ends_at: string;
    budget_items: { label: string; estimated_cost: string }[];
    checklist_items: { label: string }[];
};

// Image slot in the Figma -> gradient banner in the org tag colour (no event images are stored yet).
const GRADIENT: Record<Tone, string> = {
    orange: 'from-orange-400 to-orange-600',
    purple: 'from-purple-400 to-purple-600',
    red: 'from-red-400 to-red-600',
    gray: 'from-slate-400 to-slate-600',
    green: 'from-emerald-400 to-emerald-600',
    blue: 'from-emerald-500 to-emerald-700',
    yellow: 'from-amber-400 to-amber-600',
};

export default function Events({
    events,
    elections,
    plannable_organizations,
    can_plan_school_wide,
}: Props) {
    const params = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : '',
    );
    const [tab, setTab] = useState<'events' | 'voting'>(
        params.get('tab') === 'voting' ? 'voting' : 'events',
    );
    const [open, setOpen] = useState(params.get('new') === '1');
    const canCreate =
        plannable_organizations.length > 0 || can_plan_school_wide;
    const upcoming = events
        .filter((e) => new Date(e.starts_at) >= new Date())
        .slice(0, 3);

    return (
        <CouncilLayout title="Events & Voting">
            <div className="mb-5 flex items-center justify-between border-b border-[#E1E4EA]">
                <div className="flex gap-1">
                    {(['events', 'voting'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`rounded-t-lg px-4 py-2 text-sm font-medium capitalize ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-[#5B6478]'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                {canCreate && (
                    <button
                        onClick={() => setOpen(true)}
                        className={btnPrimary + ' mb-1'}
                    >
                        <Plus className="h-4 w-4" />
                        Create Event
                    </button>
                )}
            </div>

            {tab === 'events' ? (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <h2 className="text-lg font-bold">Upcoming Events</h2>
                        <p className="mb-4 text-sm text-[#5B6478]">
                            Manage planning, checklist, and budgets for upcoming
                            civic activities.
                        </p>
                        {events.length === 0 && (
                            <Card className="p-8 text-center text-sm text-[#5B6478]">
                                No events yet.
                            </Card>
                        )}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {events.map((e) => {
                                const tone = toneFor(e.organization);
                                const budgetPct = e.budget_allocated
                                    ? (e.budget_spent / e.budget_allocated) *
                                      100
                                    : 0;
                                const checkPct = e.checklist_total
                                    ? (e.checklist_done / e.checklist_total) *
                                      100
                                    : 0;
                                return (
                                    <Card
                                        key={e.id}
                                        className="overflow-hidden"
                                    >
                                        <div
                                            className={`h-24 bg-gradient-to-br ${GRADIENT[tone]}`}
                                        />
                                        <div className="p-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <Pill tone={tone} dot>
                                                    {e.organization}
                                                </Pill>
                                                <span className="flex items-center gap-1 text-xs text-[#5B6478]">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {e.attendees_count} RSVP
                                                </span>
                                            </div>
                                            <p className="font-semibold">
                                                {e.title}
                                            </p>
                                            <p className="mb-3 flex flex-wrap items-center gap-x-3 text-xs text-[#5B6478]">
                                                <span>
                                                    {new Date(
                                                        e.starts_at,
                                                    ).toLocaleString(
                                                        undefined,
                                                        {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                        },
                                                    )}
                                                </span>
                                                {e.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {e.location}
                                                    </span>
                                                )}
                                            </p>
                                            <div className="space-y-3 border-t border-[#E1E4EA] pt-3 text-xs">
                                                <div>
                                                    <div className="mb-1 flex justify-between">
                                                        <span className="text-[#5B6478]">
                                                            Budget Allocation
                                                        </span>
                                                        <b>
                                                            {money(
                                                                e.budget_spent,
                                                            )}{' '}
                                                            /{' '}
                                                            {money(
                                                                e.budget_allocated,
                                                            )}
                                                        </b>
                                                    </div>
                                                    <ProgressBar
                                                        value={budgetPct}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="mb-1 flex justify-between">
                                                        <span className="text-[#5B6478]">
                                                            Planning Checklist
                                                        </span>
                                                        <b>
                                                            {e.checklist_done}/
                                                            {e.checklist_total}{' '}
                                                            Tasks
                                                        </b>
                                                    </div>
                                                    <ProgressBar
                                                        value={checkPct}
                                                        tone="green"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-5">
                        <Calendar events={events} />
                        <Card className="p-5">
                            <h3 className="mb-3 text-sm font-semibold">
                                Upcoming Milestones
                            </h3>
                            {upcoming.length === 0 && (
                                <p className="text-sm text-[#5B6478]">
                                    Nothing scheduled.
                                </p>
                            )}
                            <ul className="space-y-3">
                                {upcoming.map((e) => (
                                    <li key={e.id} className="flex gap-3">
                                        <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {e.title}
                                            </p>
                                            <p className="text-xs text-[#5B6478]">
                                                {shortDate(e.starts_at)}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>
            ) : (
                <div>
                    {/* Voting tab is NOT in the Figma - a read-only overview built from the existing election data. */}
                    <h2 className="text-lg font-bold">Elections</h2>
                    <p className="mb-4 text-sm text-[#5B6478]">
                        Council-wide and organization elections in your scope.
                    </p>
                    {elections.length === 0 && (
                        <Card className="p-8 text-center text-sm text-[#5B6478]">
                            No elections yet.
                        </Card>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {elections.map((el) => (
                            <Card key={el.id} className="p-4">
                                <div className="mb-2 flex justify-between">
                                    <Pill tone={toneFor(el.organization)} dot>
                                        {el.organization}
                                    </Pill>
                                    <Pill
                                        tone={
                                            el.status === 'open'
                                                ? 'green'
                                                : el.status === 'closed'
                                                  ? 'gray'
                                                  : 'yellow'
                                        }
                                    >
                                        {el.status}
                                    </Pill>
                                </div>
                                <p className="font-semibold">{el.title}</p>
                                <p className="mb-3 text-xs text-[#5B6478]">
                                    {shortDate(el.starts_at)} –{' '}
                                    {shortDate(el.ends_at)}
                                </p>
                                <p className="text-xs text-[#5B6478]">
                                    {el.candidates_count} candidates ·{' '}
                                    <b>{el.votes_count}</b> votes cast
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <CreateEvent
                open={open}
                onClose={() => setOpen(false)}
                orgs={plannable_organizations}
                schoolWide={can_plan_school_wide}
            />
        </CouncilLayout>
    );
}

function Calendar({ events }: { events: Ev[] }) {
    const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [selectedDay, setSelectedDay] = useState(() => new Date().toDateString());
    const today = new Date();
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const eventsByDay = new Map<number, Ev[]>();
    events.forEach((event) => {
        const date = new Date(event.starts_at);
        if (date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth()) {
            eventsByDay.set(date.getDate(), [...(eventsByDay.get(date.getDate()) ?? []), event]);
        }
    });
    const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
    const selectedDate = new Date(selectedDay);
    const selectedEvents = eventsByDay.get(selectedDate.getDate()) ?? [];
    const changeMonth = (offset: number) => {
        const nextMonth = new Date(month.getFullYear(), month.getMonth() + offset, 1);
        setMonth(nextMonth);
        setSelectedDay(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1).toDateString());
    };

    return (
        <Card className="p-5">
            <div className="mb-3 flex items-center justify-between text-sm">
                <b>Calendar View</b>
                <div className="flex items-center gap-2"><button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className="rounded p-1 hover:bg-slate-100"><ChevronLeft className="h-4 w-4"/></button><span className="min-w-24 text-center text-blue-600">
                    {month.toLocaleString(undefined, {
                        month: 'long',
                        year: 'numeric',
                    })}
                </span><button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className="rounded p-1 hover:bg-slate-100"><ChevronRight className="h-4 w-4"/></button></div>
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="font-semibold text-[#5B6478]">
                        {d}
                    </span>
                ))}
                {cells.map((d, i) => (
                    d ? <button type="button" key={i} onClick={() => setSelectedDay(new Date(month.getFullYear(), month.getMonth(), d).toDateString())} aria-label={`${month.toLocaleString(undefined, { month: 'long' })} ${d}${eventsByDay.has(d) ? `, ${eventsByDay.get(d)?.length} events` : ''}`} className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full hover:bg-emerald-100 ${selectedDate.getDate() === d && selectedDate.getMonth() === month.getMonth() && selectedDate.getFullYear() === month.getFullYear() ? 'bg-blue-600 font-bold text-white hover:bg-blue-700' : d === today.getDate() && month.getMonth() === today.getMonth() && month.getFullYear() === today.getFullYear() ? 'font-bold text-blue-700' : ''}`}>{d}{eventsByDay.has(d) && <i className={`absolute bottom-0 h-1 w-1 rounded-full ${selectedDate.getDate() === d && selectedDate.getMonth() === month.getMonth() ? 'bg-white' : 'bg-orange-500'}`} />}</button> : <span key={i} />
                ))}
            </div>
            <div className="mt-4 border-t border-[#E1E4EA] pt-3"><p className="mb-2 text-xs font-semibold text-[#5B6478]">{selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>{selectedEvents.length ? <ul className="space-y-2">{selectedEvents.map((event) => <li key={event.id} className="text-xs"><p className="font-medium">{event.title}</p><p className="text-[#5B6478]">{new Date(event.starts_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} · {event.organization}</p></li>)}</ul> : <p className="text-xs text-[#5B6478]">No events on this day.</p>}</div>
        </Card>
    );
}

function CreateEvent({
    open,
    onClose,
    orgs,
    schoolWide,
}: {
    open: boolean;
    onClose: () => void;
    orgs: { id: number; name: string }[];
    schoolWide: boolean;
}) {
    const form = useForm<EventForm>({
        organization_id: String(orgs[0]?.id ?? ''),
        title: '',
        description: '',
        location: '',
        starts_at: '',
        ends_at: '',
        budget_items: [] as { label: string; estimated_cost: string }[],
        checklist_items: [] as { label: string }[],
    });
    const set = <K extends keyof EventForm>(
        k: K,
        v: (typeof form.data)[K],
    ) => form.setData(k, v as never);

    return (
        <Modal open={open} onClose={onClose} title="Create Event">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post(storeEvent().url, {
                        onSuccess: () => {
                            form.reset();
                            onClose();
                        },
                    });
                }}
                className="space-y-3"
            >
                <Field label="Organization" error={form.errors.organization_id}>
                    <select
                        className={inputCls}
                        value={form.data.organization_id}
                        onChange={(e) => set('organization_id', e.target.value)}
                    >
                        {orgs.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.name}
                            </option>
                        ))}
                        {schoolWide && (
                            <option value="">
                                School-wide (Student Council)
                            </option>
                        )}
                    </select>
                </Field>
                <Field label="Title" error={form.errors.title}>
                    <input
                        className={inputCls}
                        value={form.data.title}
                        onChange={(e) => set('title', e.target.value)}
                        required
                    />
                </Field>
                <Field label="Location" error={form.errors.location}>
                    <input
                        className={inputCls}
                        value={form.data.location}
                        onChange={(e) => set('location', e.target.value)}
                    />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Starts" error={form.errors.starts_at}>
                        <input
                            type="datetime-local"
                            className={inputCls}
                            value={form.data.starts_at}
                            onChange={(e) => set('starts_at', e.target.value)}
                            required
                        />
                    </Field>
                    <Field label="Ends" error={form.errors.ends_at}>
                        <input
                            type="datetime-local"
                            className={inputCls}
                            value={form.data.ends_at}
                            onChange={(e) => set('ends_at', e.target.value)}
                            required
                        />
                    </Field>
                </div>

                <div>
                    <div className="mb-1 flex justify-between text-xs font-medium text-[#5B6478]">
                        Budget lines
                        <button
                            type="button"
                            className="text-blue-600"
                            onClick={() =>
                                set('budget_items', [
                                    ...form.data.budget_items,
                                    { label: '', estimated_cost: '' },
                                ])
                            }
                        >
                            + Add
                        </button>
                    </div>
                    {form.data.budget_items.map((b, i) => (
                        <div key={i} className="mb-2 flex gap-2">
                            <input
                                className={inputCls}
                                placeholder="Label"
                                value={b.label}
                                onChange={(e) =>
                                    set(
                                        'budget_items',
                                        form.data.budget_items.map((x, j) =>
                                            j === i
                                                ? {
                                                      ...x,
                                                      label: e.target.value,
                                                  }
                                                : x,
                                        ),
                                    )
                                }
                            />
                            <input
                                className={inputCls + ' !w-28'}
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Cost"
                                value={b.estimated_cost}
                                onChange={(e) =>
                                    set(
                                        'budget_items',
                                        form.data.budget_items.map((x, j) =>
                                            j === i
                                                ? {
                                                      ...x,
                                                      estimated_cost:
                                                          e.target.value,
                                                  }
                                                : x,
                                        ),
                                    )
                                }
                            />
                        </div>
                    ))}
                </div>
                <div>
                    <div className="mb-1 flex justify-between text-xs font-medium text-[#5B6478]">
                        Checklist
                        <button
                            type="button"
                            className="text-blue-600"
                            onClick={() =>
                                set('checklist_items', [
                                    ...form.data.checklist_items,
                                    { label: '' },
                                ])
                            }
                        >
                            + Add
                        </button>
                    </div>
                    {form.data.checklist_items.map((c, i) => (
                        <input
                            key={i}
                            className={inputCls + ' mb-2'}
                            placeholder="Checklist item"
                            value={c.label}
                            onChange={(e) =>
                                set(
                                    'checklist_items',
                                    form.data.checklist_items.map((x, j) =>
                                        j === i ? { label: e.target.value } : x,
                                    ),
                                )
                            }
                        />
                    ))}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className={btnGhost}
                    >
                        Cancel
                    </button>
                    <button disabled={form.processing} className={btnPrimary}>
                        Create event
                    </button>
                </div>
            </form>
        </Modal>
    );
}
