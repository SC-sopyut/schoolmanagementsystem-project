import CouncilLayout from '@/layouts/council-layout';
import {
    Card,
    Field,
    Pill,
    btnGhost,
    btnPrimary,
    inputCls,
    priorityTone,
    shortDate,
    timeAgo,
    type Tone,
} from '@/components/council/ui';
import { forward, resolve, review } from '@/routes/officer/concerns';
import { store as addUpdate } from '@/routes/officer/concerns/updates';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

type Concern = {
    id: number;
    tracking_code: string;
    subject: string;
    body: string;
    category: string;
    priority: string;
    status: string;
    is_anonymous: boolean;
    submitted_by: string | null;
    organization: { id: number; name: string } | null;
    created_at: string;
    timeline: {
        stage_label: string;
        message: string | null;
        created_at: string;
    }[];
};

const STATUS: Record<string, { label: string; tone: Tone }> = {
    submitted: { label: 'New', tone: 'orange' },
    reviewed: { label: 'Reviewed', tone: 'purple' },
    forwarded: { label: 'Forwarded', tone: 'blue' },
    resolved: { label: 'Resolved', tone: 'green' },
};

/**
 * Officer inbox (not in the Figma - the Figma's officer "Concerns" screen is the submission form).
 * `submitted_by` arrives already redacted from Concern::toOfficerArray(): anonymous concerns
 * read "Anonymous student" and no student id/email is ever in this payload.
 */
export default function ConcernInbox({ concerns }: { concerns: Concern[] }) {
    const [selectedId, setSelectedId] = useState<number | null>(
        concerns[0]?.id ?? null,
    );
    const c = concerns.find((x) => x.id === selectedId) ?? null;

    return (
        <CouncilLayout title="Concerns">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
                <Card className="lg:col-span-2">
                    <div className="border-b border-[#E1E4EA] p-4 font-semibold">
                        Student Concerns ({concerns.length})
                    </div>
                    {concerns.length === 0 && (
                        <p className="p-8 text-center text-sm text-[#5B6478]">
                            No concerns yet.
                        </p>
                    )}
                    <ul className="max-h-[70vh] divide-y divide-[#E1E4EA] overflow-y-auto">
                        {concerns.map((x) => (
                            <li key={x.id}>
                                <button
                                    onClick={() => setSelectedId(x.id)}
                                    className={`w-full p-4 text-left ${x.id === selectedId ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="mb-1 flex items-center justify-between gap-2">
                                        <span className="text-xs font-semibold text-blue-600">
                                            {x.tracking_code}
                                        </span>
                                        <Pill tone={STATUS[x.status].tone}>
                                            {STATUS[x.status].label}
                                        </Pill>
                                    </div>
                                    <p className="text-sm font-medium">
                                        {x.subject}
                                    </p>
                                    <p className="text-xs text-[#5B6478]">
                                        {x.submitted_by} ·{' '}
                                        {x.organization?.name} ·{' '}
                                        {timeAgo(x.created_at)}
                                    </p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>

                <div className="lg:col-span-3">
                    {c ? (
                        <Detail key={c.id} c={c} />
                    ) : (
                        <Card className="p-8 text-center text-sm text-[#5B6478]">
                            Select a concern.
                        </Card>
                    )}
                </div>
            </div>
        </CouncilLayout>
    );
}

function Detail({ c }: { c: Concern }) {
    const notes = useForm({ officer_notes: '' });
    const update = useForm({ stage_label: '', message: '' });
    const act = (url: string) =>
        router.patch(url, {}, { preserveScroll: true });

    return (
        <Card className="space-y-4 p-6">
            <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Pill tone={STATUS[c.status].tone}>
                        {STATUS[c.status].label}
                    </Pill>
                    <Pill tone={priorityTone(c.priority)}>{c.priority}</Pill>
                    <span className="text-xs text-[#5B6478]">
                        {c.category} · {c.organization?.name}
                    </span>
                </div>
                <h3 className="text-lg font-bold">{c.subject}</h3>
                <p className="text-xs text-[#5B6478]">
                    {c.tracking_code} · from <b>{c.submitted_by}</b> ·{' '}
                    {shortDate(c.created_at)}
                </p>
            </div>
            <p className="text-sm whitespace-pre-wrap">{c.body}</p>

            <div>
                <p className="mb-2 text-[10px] font-semibold tracking-wide text-[#5B6478] uppercase">
                    Timeline
                </p>
                <ul className="space-y-2">
                    {c.timeline.map((e, i) => (
                        <li key={i} className="text-sm">
                            <b>{e.stage_label}</b>{' '}
                            <span className="text-xs text-[#5B6478]">
                                · {shortDate(e.created_at)}
                            </span>
                            {e.message && (
                                <p className="text-[#5B6478] italic">
                                    "{e.message}"
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="space-y-3 border-t border-[#E1E4EA] pt-4">
                {c.status === 'submitted' && (
                    <button
                        className={btnPrimary}
                        onClick={() => act(review(c.id).url)}
                    >
                        Mark as reviewed
                    </button>
                )}

                {c.status === 'reviewed' && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            notes.patch(forward(c.id).url, {
                                preserveScroll: true,
                            });
                        }}
                        className="space-y-2"
                    >
                        <Field
                            label="Notes for the board (also shown to the student)"
                            error={notes.errors.officer_notes}
                        >
                            <textarea
                                rows={3}
                                className={inputCls}
                                value={notes.data.officer_notes}
                                onChange={(e) =>
                                    notes.setData(
                                        'officer_notes',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                        </Field>
                        <button
                            disabled={notes.processing}
                            className={btnPrimary}
                        >
                            Forward to board
                        </button>
                    </form>
                )}

                {c.status === 'forwarded' && (
                    <button
                        className={btnPrimary}
                        onClick={() => act(resolve(c.id).url)}
                    >
                        Mark as resolved
                    </button>
                )}

                {c.status !== 'resolved' && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            update.post(addUpdate(c.id).url, {
                                preserveScroll: true,
                                onSuccess: () => update.reset(),
                            });
                        }}
                        className="space-y-2 rounded-lg bg-[#F5F6F8] p-3"
                    >
                        <p className="text-xs font-semibold">
                            Add a progress update
                        </p>
                        <input
                            className={inputCls}
                            placeholder="Stage label, e.g. Scheduled Maintenance"
                            value={update.data.stage_label}
                            onChange={(e) =>
                                update.setData('stage_label', e.target.value)
                            }
                            required
                        />
                        <textarea
                            rows={2}
                            className={inputCls}
                            placeholder="Optional reply to the student"
                            value={update.data.message}
                            onChange={(e) =>
                                update.setData('message', e.target.value)
                            }
                        />
                        <button
                            disabled={update.processing}
                            className={btnGhost}
                        >
                            Post update
                        </button>
                    </form>
                )}
            </div>
        </Card>
    );
}
