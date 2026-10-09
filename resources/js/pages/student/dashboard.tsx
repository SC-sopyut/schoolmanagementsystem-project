import CouncilLayout from '@/layouts/council-layout';
import DeletedUploads, {
    type DeletedUpload,
} from '@/components/council/deleted-uploads';
import {
    Card,
    Pill,
    StatCard,
    shortDate,
    type Tone,
} from '@/components/council/ui';
import { create, index as myConcerns } from '@/routes/student/concerns';
import { index as studentEvents } from '@/routes/student/events';
import { Link } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, CircleAlert, Ticket } from 'lucide-react';

type Props = {
    first_name: string;
    stats: {
        open_concerns: number;
        resolved_concerns: number;
        upcoming_events: number;
        events_joined: number;
    };
    events: {
        id: number;
        title: string;
        starts_at: string;
        location: string | null;
    }[];
    concerns: {
        id: number;
        tracking_code: string;
        subject: string;
        status: string;
    }[];
    deleted_uploads: DeletedUpload[];
};
const S: Record<string, { label: string; tone: Tone }> = {
    submitted: { label: 'Open', tone: 'gray' },
    reviewed: { label: 'Reviewing', tone: 'orange' },
    forwarded: { label: 'In Progress', tone: 'blue' },
    resolved: { label: 'Resolved', tone: 'green' },
};

/** Not in the Figma: a minimal student home using the same stat-card pattern. */
export default function StudentDashboard({
    first_name,
    stats,
    events,
    concerns,
    deleted_uploads,
}: Props) {
    return (
        <CouncilLayout title="Dashboard">
            <h2 className="text-2xl font-bold">Welcome back, {first_name}</h2>
            <p className="mb-5 text-sm text-[#5B6478]">
                Here's what's happening across your organizations.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Open Concerns"
                    value={stats.open_concerns}
                    icon={CircleAlert}
                    tone="orange"
                />
                <StatCard
                    label="Resolved Concerns"
                    value={stats.resolved_concerns}
                    icon={CheckCircle2}
                    tone="green"
                />
                <StatCard
                    label="Upcoming Events"
                    value={stats.upcoming_events}
                    icon={CalendarDays}
                    tone="blue"
                />
                <StatCard
                    label="Events Joined"
                    value={stats.events_joined}
                    icon={Ticket}
                    tone="purple"
                />
            </div>
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <Card className="p-5">
                    <div className="mb-3 flex justify-between">
                        <h3 className="font-semibold">My Recent Concerns</h3>
                        <Link
                            href={create().url}
                            className="text-xs font-semibold text-blue-600"
                        >
                            Submit new
                        </Link>
                    </div>
                    {concerns.length === 0 && (
                        <p className="text-sm text-[#5B6478]">
                            Nothing submitted yet.
                        </p>
                    )}
                    <ul className="space-y-2">
                        {concerns.map((c) => (
                            <li
                                key={c.id}
                                className="flex items-center justify-between rounded-lg border border-[#E1E4EA] px-3 py-2"
                            >
                                <span className="text-sm">
                                    <b className="text-blue-600">
                                        {c.tracking_code}
                                    </b>{' '}
                                    {c.subject}
                                </span>
                                <Pill tone={S[c.status].tone}>
                                    {S[c.status].label}
                                </Pill>
                            </li>
                        ))}
                    </ul>
                    {concerns.length > 0 && (
                        <Link
                            href={myConcerns().url}
                            className="mt-3 block text-xs font-semibold text-blue-600"
                        >
                            View all
                        </Link>
                    )}
                </Card>
                <Card className="p-5">
                    <div className="mb-3 flex justify-between">
                        <h3 className="font-semibold">Upcoming Events</h3>
                        <Link
                            href={studentEvents().url}
                            className="text-xs font-semibold text-blue-600"
                        >
                            View all
                        </Link>
                    </div>
                    {events.length === 0 && (
                        <p className="text-sm text-[#5B6478]">
                            No upcoming events.
                        </p>
                    )}
                    <ul className="space-y-3">
                        {events.map((e) => (
                            <li key={e.id}>
                                <p className="text-sm font-medium">{e.title}</p>
                                <p className="text-xs text-[#5B6478]">
                                    {shortDate(e.starts_at)}
                                    {e.location ? ` · ${e.location}` : ''}
                                </p>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
            <div className="mt-5">
                <DeletedUploads uploads={deleted_uploads} />
            </div>
        </CouncilLayout>
    );
}
