import CouncilLayout from '@/layouts/council-layout';
import {
    Card,
    Pill,
    StatCard,
    money,
    // shortDate,
    type Tone,
} from '@/components/council/ui';
import { index as officerConcerns } from '@/routes/officer/concerns';
import { index as officerEvents } from '@/routes/officer/events';
import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    CircleAlert,
    DollarSign,
    Plus,
    Users,
} from 'lucide-react';

type Concern = {
    id: number;
    tracking_code: string;
    subject: string;
    category: string;
    status: string;
};
type Props = {
    label: string;
    first_name: string;
    stats: {
        open_concerns: number;
        high_priority_concerns: number;
        budget_allocated: number;
        budget_remaining: number;
        budget_used_pct: number;
        officers: number;
    };
    recent_concerns: Concern[];
    upcoming_events: {
        id: number;
        title: string;
        starts_at: string;
        location: string | null;
    }[];
    upcoming_events_count: number;
    announcements: { id: number; title: string; body: string }[];
};

// Figma badge wording: New / In Progress / Resolved.
const badge = (s: string): { label: string; tone: Tone } =>
    s === 'submitted'
        ? { label: 'New', tone: 'orange' }
        : s === 'resolved'
          ? { label: 'Resolved', tone: 'green' }
          : { label: 'In Progress', tone: 'blue' };

export default function PresidentDashboard({
    first_name,
    stats,
    recent_concerns,
    upcoming_events,
    upcoming_events_count,
    announcements,
}: Props) {
    const next = upcoming_events[0];
    const remainingPct = 100 - stats.budget_used_pct;

    return (
        <CouncilLayout title="Dashboard">
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <h2 className="text-2xl font-bold">
                    Welcome back, {first_name}! 👋
                </h2>
                <p className="mt-1 text-sm text-blue-100">
                    "Leadership is not about being in charge. It is about taking
                    care of those in your charge." Let's build a historic term
                    together.
                </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Open Concerns"
                    value={`${stats.open_concerns} Pending`}
                    icon={CircleAlert}
                    tone="orange"
                    sub={`${stats.high_priority_concerns} high priority`}
                />
                <StatCard
                    label="Upcoming Events"
                    value={`${upcoming_events_count} Events`}
                    icon={CalendarDays}
                    tone="blue"
                    sub={next ? `Next: ${next.title}` : 'Nothing scheduled'}
                />
                <StatCard
                    label="Budget Remaining"
                    value={money(stats.budget_remaining)}
                    icon={DollarSign}
                    tone="green"
                    sub={`${remainingPct}% of total allocated`}
                />
                <StatCard
                    label="Active Members"
                    value={`${stats.officers} Officers`}
                    icon={Users}
                    tone="purple"
                    sub="Officers in your scope"
                />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
                <Card className="p-5 lg:col-span-2">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold">
                            Recent Student Concerns
                        </h3>
                        <Link
                            href={officerConcerns().url}
                            className="text-xs font-semibold text-blue-600"
                        >
                            View All
                        </Link>
                    </div>
                    {recent_concerns.length === 0 && (
                        <p className="py-6 text-center text-sm text-[#5B6478]">
                            No concerns yet.
                        </p>
                    )}
                    <ul className="space-y-2">
                        {recent_concerns.map((c) => (
                            <li
                                key={c.id}
                                className="flex items-center justify-between rounded-lg border border-[#E1E4EA] px-4 py-3"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {c.subject}
                                    </p>
                                    <p className="text-xs text-[#5B6478]">
                                        {c.category}
                                    </p>
                                </div>
                                <Pill tone={badge(c.status).tone}>
                                    {badge(c.status).label}
                                </Pill>
                            </li>
                        ))}
                    </ul>
                </Card>

                <div className="space-y-5">
                    <Card className="p-5">
                        <h3 className="mb-3 font-semibold">Upcoming Events</h3>
                        {upcoming_events.length === 0 && (
                            <p className="text-sm text-[#5B6478]">
                                No upcoming events.
                            </p>
                        )}
                        <ul className="space-y-3">
                            {upcoming_events.slice(0, 2).map((e) => {
                                const d = new Date(e.starts_at);
                                return (
                                    <li
                                        key={e.id}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="w-11 rounded-lg bg-blue-50 py-1 text-center text-blue-600">
                                            <span className="block text-[9px] font-bold uppercase">
                                                {d.toLocaleString(undefined, {
                                                    month: 'short',
                                                })}
                                            </span>
                                            <span className="block text-base leading-none font-bold">
                                                {d.getDate()}
                                            </span>
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {e.title}
                                            </p>
                                            <p className="text-xs text-[#5B6478]">
                                                {d.toLocaleTimeString(
                                                    undefined,
                                                    {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                    },
                                                )}
                                                {e.location
                                                    ? ` · ${e.location}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </Card>

                    <Card className="p-5">
                        <h3 className="mb-3 font-semibold">
                            Latest Announcements
                        </h3>
                        {announcements.length === 0 && (
                            <p className="text-sm text-[#5B6478]">
                                No announcements yet.
                            </p>
                        )}
                        <ul className="space-y-3">
                            {announcements.map((a) => (
                                <li
                                    key={a.id}
                                    className="border-b border-[#E1E4EA] pb-3 last:border-0 last:pb-0"
                                >
                                    <p className="text-sm font-semibold">
                                        {a.title}
                                    </p>
                                    <p className="line-clamp-2 text-xs text-[#5B6478]">
                                        {a.body}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <Link
                    href="/officer/announcements"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#101B33] px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                    <Plus className="h-4 w-4" />
                    Post Announcement
                </Link>
                <Link
                    href={officerEvents().url + '?new=1'}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    New Event
                </Link>
            </div>
        </CouncilLayout>
    );
}
