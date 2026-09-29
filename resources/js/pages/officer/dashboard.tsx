import CouncilLayout from '@/layouts/council-layout';
import { Card, Avatar, Pill, StatCard, shortDate, timeAgo, toneFor, type Tone } from '@/components/council/ui';
import { board } from '@/routes/officer';
import { Link } from '@inertiajs/react';
import { CalendarDays, CircleAlert, ListChecks, Users } from 'lucide-react';

type Props = {
    label: string; today: string;
    stats: { active_tasks: number; tasks_new_this_week: number; pending_concerns: number; concerns_resolved_this_week: number; members: number; organizations: number };
    high_priority_tasks: { id: number; title: string; status: string; due_date: string | null; committee: string | null }[];
    upcoming_events: { id: number; title: string; starts_at: string; location: string | null; organization: string }[];
    upcoming_events_count: number;
    recent_actions: { id: number; actor: string; message: string; created_at: string }[];
    user?: { name: string };
};

const STATUS: Record<string, { label: string; tone: Tone }> = {
    backlog: { label: 'Backlog', tone: 'gray' }, todo: { label: 'To Do', tone: 'gray' },
    in_progress: { label: 'In Progress', tone: 'blue' }, review: { label: 'Review', tone: 'purple' }, done: { label: 'Done', tone: 'green' },
};

export default function OfficerDashboard({ label, today, stats, high_priority_tasks, upcoming_events, upcoming_events_count, recent_actions }: Props) {
    const next = upcoming_events[0];
    return (
        <CouncilLayout title="Dashboard">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold">Welcome back, {label}</h2>
                    <p className="text-sm text-[#5B6478]">You have {stats.pending_concerns} pending concerns and {stats.active_tasks} active tasks.</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-lg border border-[#E1E4EA] bg-white px-3 py-1.5 text-sm">
                    <CalendarDays className="h-4 w-4 text-[#5B6478]" />
                    {new Date(today).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Active Tasks" value={stats.active_tasks} icon={ListChecks} tone="blue" sub={`+${stats.tasks_new_this_week} this week`} subTone="green" />
                <StatCard label="Pending Concerns" value={stats.pending_concerns} icon={CircleAlert} tone="red" sub={`${stats.concerns_resolved_this_week} resolved this week`} subTone="green" />
                <StatCard label="Upcoming Events" value={upcoming_events_count} icon={CalendarDays} tone="orange" sub={next ? `Next: ${next.title}` : 'Nothing scheduled'} subTone="muted" />
                <StatCard label="Total Members" value={stats.members} icon={Users} tone="green" sub={`Across ${stats.organizations} organization${stats.organizations === 1 ? '' : 's'}`} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
                <Card className="p-5 lg:col-span-2">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold">High Priority Tasks</h3>
                        <Link href={board().url} className="text-xs font-semibold text-blue-600">View Board</Link>
                    </div>
                    {high_priority_tasks.length === 0 && <p className="py-6 text-center text-sm text-[#5B6478]">No high priority tasks.</p>}
                    <ul className="divide-y divide-[#E1E4EA]">
                        {high_priority_tasks.map((t) => (
                            <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{t.title}</p>
                                    <p className="text-xs text-[#5B6478]">{t.status === 'done' ? 'Completed' : `Due: ${shortDate(t.due_date)}`}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    {t.committee && <Pill tone={toneFor(t.committee)} dot>{t.committee}</Pill>}
                                    <Pill tone={STATUS[t.status]?.tone}>{STATUS[t.status]?.label ?? t.status}</Pill>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                <div className="space-y-5">
                    <Card className="p-5">
                        <h3 className="mb-3 font-semibold">Upcoming Milestones</h3>
                        {upcoming_events.length === 0 && <p className="text-sm text-[#5B6478]">No upcoming events.</p>}
                        <ul className="space-y-3">
                            {upcoming_events.map((e) => (
                                <li key={e.id} className="flex gap-3">
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                                    <div>
                                        <p className="text-sm font-medium">{e.title}</p>
                                        <p className="text-xs text-[#5B6478]">{shortDate(e.starts_at)} · <span className="text-orange-600">{e.organization}</span></p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="p-5">
                        <h3 className="mb-3 font-semibold">Recent Actions</h3>
                        {recent_actions.length === 0 && <p className="text-sm text-[#5B6478]">No recent activity.</p>}
                        <ul className="space-y-3">
                            {recent_actions.map((a) => (
                                <li key={a.id} className="flex gap-3">
                                    <Avatar name={a.actor} size={28} />
                                    <div>
                                        <p className="text-sm"><b>{a.actor}</b> {a.message}</p>
                                        <p className="text-xs text-[#5B6478]">{timeAgo(a.created_at)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </CouncilLayout>
    );
}
