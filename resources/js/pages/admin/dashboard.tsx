import AdminLayout from '@/layouts/admin-layout';
import OfficerAnalytics from '@/components/council/officer-analytics';
import DeletedUploads, { type DeletedUpload } from '@/components/council/deleted-uploads';
import {
    Card,
    StatCard,
    timeAgo,
} from '@/components/council/ui';
import { Link } from '@inertiajs/react';
import { CircleAlert, Eye, EyeOff, ListChecks } from 'lucide-react';

type Analytics = { tasks_by_status: { status: string; count: number }[]; concerns_by_status: { status: string; count: number }[]; monthly_activity: { month: string; key: string; tasks: number; concerns: number }[] };
type Props = {
    stats: {
        total_concerns: number;
        open_concerns: number;
        anonymous_concerns: number;
        reveals_30d: number;
        students: number;
        officers: number;
        organizations: number;
        tasks: number; open_tasks: number; events: number; upcoming_events: number; documents: number;
    };
    analytics: Analytics;
    recent_reveals: {
        id: number;
        admin: string | null;
        viewed_at: string;
        tracking_code: string | null;
        subject: string | null;
    }[];
    recent_activity: { id: number; actor: string; action: string; organization: string | null; detail: string | null; created_at: string }[];
    deleted_uploads: DeletedUpload[];
};

export default function AdminDashboard({
    stats,
    analytics,
    recent_reveals,
    recent_activity,
    deleted_uploads,
}: Props) {
    return (
        <AdminLayout title="Administrator dashboard">
            <h1 className="text-2xl font-bold">Administrator dashboard</h1>
            <p className="mb-6 text-sm text-[#5B6478]">
                {stats.students} accounts · {stats.officers} officers ·{' '}
                {stats.organizations} organizations
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total Concerns"
                    value={stats.total_concerns}
                    icon={ListChecks}
                    tone="blue"
                />
                <StatCard label="Active Tasks" value={stats.open_tasks} icon={ListChecks} tone="purple" sub={`${stats.tasks} total tasks`} />
                <StatCard label="Upcoming Events" value={stats.upcoming_events} icon={CircleAlert} tone="green" sub={`${stats.events} total events`} />
                <StatCard label="Documents" value={stats.documents} icon={ListChecks} tone="blue" sub="Uploaded to the repository" />
                <StatCard
                    label="Open Concerns"
                    value={stats.open_concerns}
                    icon={CircleAlert}
                    tone="orange"
                />
                <StatCard
                    label="Anonymous"
                    value={stats.anonymous_concerns}
                    icon={EyeOff}
                    tone="purple"
                    sub="Identity hidden from officers"
                />
                <StatCard
                    label="Identity Reveals (30d)"
                    value={stats.reveals_30d}
                    icon={Eye}
                    tone="red"
                    sub="Every reveal is logged"
                />
            </div>

            <OfficerAnalytics {...analytics} scope="platform" />

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="lg:col-span-2">
                    <DeletedUploads uploads={deleted_uploads} />
                </div>
                <Card className="p-5 lg:col-span-2">
                    <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Platform overview</h2><Link href="/admin/users" className="text-xs font-semibold text-blue-600">View all users</Link></div>
                    <p className="text-sm text-[#5B6478]">{stats.students} students · {stats.officers} officers · {stats.organizations} organizations · {stats.open_concerns} open concerns · {stats.open_tasks} active tasks</p>
                </Card>
                <Card className="p-5 lg:col-span-2"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Recent system activity</h2><Link href="/admin/audit" className="text-xs font-semibold text-blue-600">Full audit log</Link></div>{recent_activity.length === 0 ? <p className="py-4 text-sm text-[#5B6478]">No activity has been recorded yet.</p> : <ul className="divide-y divide-[#E1E4EA]">{recent_activity.map((entry) => <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"><span><b>{entry.actor}</b> {entry.action.replaceAll('.', ' ')}{entry.detail ? ` · ${entry.detail}` : ''}</span><span className="text-xs text-[#5B6478]">{entry.organization ?? 'Platform'} · {timeAgo(entry.created_at)}</span></li>)}</ul>}</Card>
                <Card className="p-5 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold">
                            Recent identity reveals
                        </h2>
                        <Link
                            href="/admin/audit"
                            className="text-xs font-semibold text-blue-600"
                        >
                            View audit log
                        </Link>
                    </div>
                    {recent_reveals.length === 0 && (
                        <p className="py-6 text-center text-sm text-[#5B6478]">
                            No identities have been revealed.
                        </p>
                    )}
                    <ul className="divide-y divide-[#E1E4EA]">
                        {recent_reveals.map((v) => (
                            <li key={v.id} className="py-2.5 text-sm">
                                <p>
                                    <b>{v.admin ?? 'Admin'}</b> revealed{' '}
                                    <span className="font-semibold text-blue-600">
                                        {v.tracking_code}
                                    </span>
                                </p>
                                <p className="truncate text-xs text-[#5B6478]">
                                    {v.subject} · {timeAgo(v.viewed_at)}
                                </p>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </AdminLayout>
    );
}
