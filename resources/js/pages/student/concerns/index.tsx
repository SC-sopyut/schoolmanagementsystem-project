import CouncilLayout from '@/layouts/council-layout';
import {
    Card,
    Pill,
    btnPrimary,
    priorityTone,
    shortDate,
    timeAgo,
    Avatar,
    type Tone,
} from '@/components/council/ui';
import { create } from '@/routes/student/concerns';
import { Link } from '@inertiajs/react';
import { Check, Plus } from 'lucide-react';
import { Fragment, useState } from 'react';

type Entry = {
    id: number;
    stage_label: string;
    message: string | null;
    created_at: string;
    officer: { name: string | null; position: string | null } | null;
};
type Concern = {
    id: number;
    tracking_code: string;
    subject: string;
    body: string;
    category: string;
    priority: string;
    status: string;
    is_anonymous: boolean;
    organization: string | null;
    updated_at: string;
    created_at: string;
    timeline: Entry[];
};

const STATUS: Record<string, { label: string; tone: Tone }> = {
    submitted: { label: 'Open', tone: 'gray' },
    reviewed: { label: 'Reviewing', tone: 'orange' },
    forwarded: { label: 'In Progress', tone: 'blue' },
    resolved: { label: 'Resolved', tone: 'green' },
};
const TABS = [
    { key: 'all', label: 'All', match: () => true },
    {
        key: 'open',
        label: 'Open',
        match: (c: Concern) => ['submitted', 'reviewed'].includes(c.status),
    },
    {
        key: 'progress',
        label: 'In Progress',
        match: (c: Concern) => c.status === 'forwarded',
    },
    {
        key: 'resolved',
        label: 'Resolved',
        match: (c: Concern) => c.status === 'resolved',
    },
];

export default function MyConcerns({ concerns }: { concerns: Concern[] }) {
    const [tab, setTab] = useState('all');
    const [openId, setOpenId] = useState<number | null>(
        concerns[0]?.id ?? null,
    );
    const [newestFirst, setNewestFirst] = useState(true);

    const rows = concerns
        .filter(TABS.find((t) => t.key === tab)!.match)
        .sort(
            (a, b) =>
                (newestFirst ? 1 : -1) *
                (new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()),
        );

    return (
        <CouncilLayout title="My Concerns">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold">
                        My Submitted Concerns
                    </h2>
                    <p className="text-sm text-[#5B6478]">
                        Real-time resolution oversight, officer communications,
                        and history records.
                    </p>
                </div>
                <Link href={create().url} className={btnPrimary}>
                    <Plus className="h-4 w-4" />
                    Submit New Concern
                </Link>
            </div>

            <Card>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E1E4EA] p-3">
                    <div className="flex gap-1">
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`rounded-lg px-3 py-1.5 text-sm ${tab === t.key ? 'bg-blue-600 font-semibold text-white' : 'text-[#5B6478]'}`}
                            >
                                {t.label} ({concerns.filter(t.match).length})
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setNewestFirst(!newestFirst)}
                        className="text-xs text-[#5B6478]"
                    >
                        Sort by: Date Submitted {newestFirst ? '↓' : '↑'}
                    </button>
                </div>

                {rows.length === 0 && (
                    <p className="p-8 text-center text-sm text-[#5B6478]">
                        No concerns here yet.
                    </p>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                        {rows.length > 0 && (
                            <thead className="bg-[#F5F6F8] text-[11px] tracking-wide text-[#5B6478] uppercase">
                                <tr>
                                    <th className="p-3">Tracking #</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                </tr>
                            </thead>
                        )}
                        <tbody>
                            {rows.map((c) => {
                                const open = openId === c.id;
                                const reply = [...c.timeline]
                                    .reverse()
                                    .find((e) => e.message);
                                return (
                                    <Fragment key={c.id}>
                                        <tr
                                            onClick={() =>
                                                setOpenId(open ? null : c.id)
                                            }
                                            className={`cursor-pointer border-t border-[#E1E4EA] ${open ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}
                                        >
                                            <td className="p-3 font-semibold text-blue-600">
                                                {c.tracking_code}
                                            </td>
                                            <td className="font-medium">
                                                {c.subject}
                                                {c.is_anonymous && (
                                                    <span className="ml-2 text-[10px] text-[#5B6478]">
                                                        (anonymous)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-[#5B6478]">
                                                {c.category}
                                            </td>
                                            <td>
                                                <Pill
                                                    tone={priorityTone(
                                                        c.priority,
                                                    )}
                                                >
                                                    {c.priority}
                                                </Pill>
                                            </td>
                                            <td>
                                                <Pill
                                                    tone={STATUS[c.status].tone}
                                                >
                                                    {STATUS[c.status].label}
                                                </Pill>
                                            </td>
                                            <td className="text-xs text-[#5B6478]">
                                                {timeAgo(c.updated_at)}
                                            </td>
                                        </tr>
                                        {open && (
                                            <tr className="bg-blue-50/40">
                                                <td
                                                    colSpan={6}
                                                    className="px-4 pb-5"
                                                >
                                                    <p className="text-[10px] font-semibold text-[#5B6478] uppercase">
                                                        Situational description
                                                    </p>
                                                    <p className="mb-3 text-sm whitespace-pre-wrap">
                                                        {c.body}
                                                    </p>
                                                    {reply && (
                                                        <div className="mb-4 flex gap-3 rounded-lg bg-slate-100 p-3">
                                                            <Avatar
                                                                name={
                                                                    reply
                                                                        .officer
                                                                        ?.name
                                                                }
                                                                size={30}
                                                            />
                                                            <div>
                                                                <p className="text-xs">
                                                                    <b>
                                                                        {reply
                                                                            .officer
                                                                            ?.name ??
                                                                            'Officer'}
                                                                    </b>
                                                                    {reply
                                                                        .officer
                                                                        ?.position &&
                                                                        ` (${reply.officer.position})`}{' '}
                                                                    <span className="text-[#5B6478]">
                                                                        ·{' '}
                                                                        {timeAgo(
                                                                            reply.created_at,
                                                                        )}
                                                                    </span>
                                                                </p>
                                                                <p className="text-sm italic">
                                                                    "
                                                                    {
                                                                        reply.message
                                                                    }
                                                                    "
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                                        {c.timeline.map(
                                                            (e, i) => (
                                                                <span
                                                                    key={e.id}
                                                                    className={`flex items-center gap-1 ${i === c.timeline.length - 1 && c.status !== 'resolved' ? 'font-semibold text-blue-600' : 'text-[#5B6478]'}`}
                                                                >
                                                                    {i ===
                                                                        c
                                                                            .timeline
                                                                            .length -
                                                                            1 &&
                                                                    c.status !==
                                                                        'resolved' ? (
                                                                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                                                                    ) : (
                                                                        <Check className="h-3 w-3 text-emerald-600" />
                                                                    )}
                                                                    {
                                                                        e.stage_label
                                                                    }{' '}
                                                                    (
                                                                    {shortDate(
                                                                        e.created_at,
                                                                    )}
                                                                    )
                                                                    {i <
                                                                        c
                                                                            .timeline
                                                                            .length -
                                                                            1 && (
                                                                        <span className="ml-2 text-slate-300">
                                                                            —
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </CouncilLayout>
    );
}
