import AdminLayout from '@/layouts/admin-layout';
import {
    Card,
    Pill,
    StatCard,
    timeAgo,
    type Tone,
} from '@/components/council/ui';
import { Link } from '@inertiajs/react';
import { CircleAlert, Eye, EyeOff, ListChecks } from 'lucide-react';

type Props = {
    stats: {
        total_concerns: number;
        open_concerns: number;
        anonymous_concerns: number;
        reveals_30d: number;
        students: number;
        officers: number;
        organizations: number;
    };
    by_status: { status: string; count: number }[];
    recent_reveals: {
        id: number;
        admin: string | null;
        viewed_at: string;
        tracking_code: string | null;
        subject: string | null;
    }[];
};

const STATUS: Record<string, { label: string; tone: Tone }> = {
    submitted: { label: 'Submitted', tone: 'orange' },
    reviewed: { label: 'Reviewed', tone: 'purple' },
    forwarded: { label: 'Forwarded', tone: 'blue' },
    resolved: { label: 'Resolved', tone: 'green' },
};

export default function AdminDashboard({
    stats,
    by_status,
    recent_reveals,
}: Props) {
    const total = Math.max(stats.total_concerns, 1);

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

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <Card className="p-5">
                    <h2 className="mb-4 font-semibold">Concerns by status</h2>
                    <ul className="space-y-3">
                        {by_status.map((s) => (
                            <li key={s.status}>
                                <div className="mb-1 flex justify-between text-sm">
                                    <Pill
                                        tone={STATUS[s.status]?.tone ?? 'gray'}
                                    >
                                        {STATUS[s.status]?.label ?? s.status}
                                    </Pill>
                                    <b>{s.count}</b>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-100">
                                    <div
                                        className="h-1.5 rounded-full bg-blue-600"
                                        style={{
                                            width: `${(s.count / total) * 100}%`,
                                        }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="p-5">
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
