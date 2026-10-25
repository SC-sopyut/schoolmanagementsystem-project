import { useState, type FormEvent } from 'react';
import { router } from '@inertiajs/react';
import CouncilLayout from '@/layouts/council-layout';
import { Card, Pill, shortDate, toneFor } from '@/components/council/ui';
import { Plus, X } from 'lucide-react';

type Election = {
    id: number;
    title: string;
    description: string | null;
    status: 'draft' | 'open' | 'closed' | 'expired';
    organization: string;
    starts_at: string;
    ends_at: string;
    candidates_count: number;
    votes_count: number;
    positions: string[];
    candidates: {
        id: number;
        name: string;
        position: string;
        party_name: string | null;
        platform: string | null;
    }[];
    eligible_candidates: { id: number; name: string }[];
};
type Org = { id: number; name: string };

export default function Voting({
    elections,
    organizations,
    can_create_school_wide,
}: {
    elections: Election[];
    organizations: Org[];
    can_create_school_wide: boolean;
}) {
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [actionErrors, setActionErrors] = useState<Record<number, string>>(
        {},
    );
    const [candidateData, setCandidateData] = useState<
        Record<number, { user_id: string; position: string; party_name: string; platform: string }>
    >({});
    const [editing, setEditing] = useState<Election | null>(null);
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        positions: '',
        starts_at: '',
        ends_at: '',
    });
    const [data, setData] = useState({
        title: '',
        organization_id: '',
        positions: '',
        starts_at: '',
        ends_at: '',
        description: '',
    });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setErrors({});
        router.post(
            '/officer/voting',
            {
                ...data,
                organization_id: data.organization_id || null,
                positions: data.positions
                    .split(',')
                    .map((x) => x.trim())
                    .filter(Boolean),
            },
            {
                onError: (validationErrors) =>
                    setErrors(validationErrors as Record<string, string>),
                onSuccess: () => {
                    setShow(false);
                    setData({
                        title: '',
                        organization_id: '',
                        positions: '',
                        starts_at: '',
                        ends_at: '',
                        description: '',
                    });
                },
                onFinish: () => setBusy(false),
            },
        );
    };
    const action = (id: number, name: 'open' | 'close' | 'publish-results') => {
        setActionErrors((current) => ({ ...current, [id]: '' }));
        router.post(`/officer/voting/${id}/${name}`, {
            preserveScroll: true,
            onError: (responseErrors) =>
                setActionErrors((current) => ({
                    ...current,
                    [id]: Object.values(responseErrors)[0] ?? 'Unable to update this election.',
                })),
        });
    };
    const reschedule = (election: Election) => {
        const starts_at = window.prompt('New start date and time (YYYY-MM-DD HH:MM)', election.starts_at.slice(0, 16));
        if (!starts_at) return;
        const ends_at = window.prompt('New end date and time (YYYY-MM-DD HH:MM)', election.ends_at.slice(0, 16));
        if (!ends_at) return;
        const reason = window.prompt('Why are these election dates changing? This will be saved in the activity log.');
        if (!reason?.trim()) return;
        router.post(`/officer/voting/${election.id}/reschedule`, { starts_at, ends_at, reason }, { preserveScroll: true });
    };
    const candidateForm = (election: Election) =>
        candidateData[election.id] ?? {
            user_id: '',
            position: election.positions[0] ?? '',
            party_name: '',
            platform: '',
        };
    const addCandidate = (election: Election) => {
        const form = candidateForm(election);
        setActionErrors((current) => ({ ...current, [election.id]: '' }));
        router.post(`/officer/voting/${election.id}/candidates`, form, {
            preserveScroll: true,
            onSuccess: () =>
                setCandidateData((current) => ({
                    ...current,
                    [election.id]: {
                        user_id: '',
                        position: election.positions[0] ?? '',
                        party_name: '',
                        platform: '',
                    },
                })),
            onError: (responseErrors) =>
                setActionErrors((current) => ({
                    ...current,
                    [election.id]: Object.values(responseErrors)[0] ?? 'Unable to add this candidate.',
                })),
        });
    };
    const beginEdit = (election: Election) => {
        setEditing(election);
        setErrors({});
        setEditData({
            title: election.title,
            description: election.description ?? '',
            positions: election.positions.join(', '),
            starts_at: election.starts_at.slice(0, 16),
            ends_at: election.ends_at.slice(0, 16),
        });
    };
    const saveEdit = (event: FormEvent) => {
        event.preventDefault();
        if (!editing) return;
        setBusy(true);
        setErrors({});
        router.patch(
            `/officer/voting/${editing.id}`,
            {
                ...editData,
                positions: editData.positions.split(',').map((position) => position.trim()).filter(Boolean),
            },
            {
                preserveScroll: true,
                onError: (validationErrors) => setErrors(validationErrors as Record<string, string>),
                onSuccess: () => setEditing(null),
                onFinish: () => setBusy(false),
            },
        );
    };
    return (
        <CouncilLayout title="Voting">
            <div className="mb-5 flex items-end justify-between">
                <div>
                    <h2 className="text-lg font-bold">Elections</h2>
                    <p className="text-sm text-[#5B6478]">
                        Create and run elections in your organization’s scope.
                    </p>
                </div>
                <button
                    onClick={() => setShow(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                >
                    <Plus className="h-4 w-4" />
                    Create election
                </button>
            </div>
            {show && (
                <Card className="mb-5 p-5">
                    <div className="mb-4 flex justify-between">
                        <div>
                            <h3 className="font-semibold">New election</h3>
                            <p className="text-sm text-[#5B6478]">
                                Drafts are hidden until voting opens.
                            </p>
                        </div>
                        <button onClick={() => setShow(false)}>
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <form
                        onSubmit={submit}
                        className="grid gap-4 md:grid-cols-2"
                    >
                        <Field label="Election title" error={errors.title}>
                            <input
                                required
                                value={data.title}
                                onChange={(e) =>
                                    setData({ ...data, title: e.target.value })
                                }
                            />
                        </Field>
                        <Field label="Scope" error={errors.organization_id}>
                            <select
                                value={data.organization_id}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        organization_id: e.target.value,
                                    })
                                }
                            >
                                <option value="">
                                    {can_create_school_wide
                                        ? 'School-wide'
                                        : 'Select organization'}
                                </option>
                                {organizations.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field
                            label="Positions (separate with commas)"
                            error={errors.positions}
                        >
                            <input
                                required
                                value={data.positions}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        positions: e.target.value,
                                    })
                                }
                                placeholder="President, Secretary"
                            />
                        </Field>
                        <Field label="Starts (AM/PM)" error={errors.starts_at}>
                            <DateTimeField
                                value={data.starts_at}
                                onChange={(value) =>
                                    setData({
                                        ...data,
                                        starts_at: value,
                                    })
                                }
                            />
                            <TimeHint value={data.starts_at} />
                        </Field>
                        <Field label="Ends (AM/PM)" error={errors.ends_at}>
                            <DateTimeField
                                value={data.ends_at}
                                onChange={(value) =>
                                    setData({
                                        ...data,
                                        ends_at: value,
                                    })
                                }
                            />
                            <TimeHint value={data.ends_at} />
                        </Field>
                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShow(false)}
                                className="rounded-lg border px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={busy}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                            >
                                {busy ? 'Creating…' : 'Create draft'}
                            </button>
                        </div>
                    </form>
                </Card>
            )}
            {editing && (
                <Card className="mb-5 p-5">
                    <div className="mb-4 flex justify-between">
                        <div>
                            <h3 className="font-semibold">Edit draft election</h3>
                            <p className="text-sm text-[#5B6478]">
                                Changes are recorded in the activity log.
                            </p>
                        </div>
                        <button onClick={() => setEditing(null)} aria-label="Close edit form">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={saveEdit} className="grid gap-4 md:grid-cols-2">
                        <Field label="Election title" error={errors.title}>
                            <input required value={editData.title} onChange={(event) => setEditData({ ...editData, title: event.target.value })} />
                        </Field>
                        <Field label="Positions (separate with commas)" error={errors.positions}>
                            <input required disabled={editing.candidates_count > 0} value={editData.positions} onChange={(event) => setEditData({ ...editData, positions: event.target.value })} />
                        </Field>
                        <Field label="Starts (AM/PM)" error={errors.starts_at}>
                            <DateTimeField value={editData.starts_at} onChange={(value) => setEditData({ ...editData, starts_at: value })} />
                        </Field>
                        <Field label="Ends (AM/PM)" error={errors.ends_at}>
                            <DateTimeField value={editData.ends_at} onChange={(value) => setEditData({ ...editData, ends_at: value })} />
                        </Field>
                        <Field label="Description" error={errors.description}>
                            <input value={editData.description} onChange={(event) => setEditData({ ...editData, description: event.target.value })} />
                        </Field>
                        <div className="flex items-end gap-2">
                            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                            <button disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                                {busy ? 'Saving…' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                    {editing.candidates_count > 0 && (
                        <p className="mt-3 text-xs text-[#5B6478]">Positions are locked because candidates have already been added.</p>
                    )}
                </Card>
            )}
            {elections.length === 0 ? (
                <Card className="p-8 text-center text-sm text-[#5B6478]">
                    No elections yet. Create a draft to get started.
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {elections.map((e) => (
                        <Card key={e.id} className="p-4">
                            <div className="mb-2 flex justify-between">
                                <Pill tone={toneFor(e.organization)} dot>
                                    {e.organization}
                                </Pill>
                                <Pill
                                    tone={
                                        e.status === 'open'
                                            ? 'green'
                                            : e.status === 'closed'
                                              ? 'gray'
                                              : e.status === 'expired'
                                                ? 'red'
                                              : 'yellow'
                                    }
                                >
                                    {e.status}
                                </Pill>
                            </div>
                            <p className="font-semibold">{e.title}</p>
                            <p className="text-xs text-[#5B6478]">
                                {shortDate(e.starts_at)} –{' '}
                                {shortDate(e.ends_at)}
                            </p>
                            <p className="mt-3 text-xs text-[#5B6478]">
                                {e.candidates_count} candidates ·{' '}
                                {e.status === 'open'
                                    ? 'Turnout hidden'
                                    : `${e.votes_count} votes cast`}
                            </p>
                            {e.status === 'draft' && (
                                <div className="mt-3 rounded-lg border border-[#31583a] bg-[#173a21] p-3 shadow-inner">
                                    <p className="text-xs font-semibold text-[#e4f1df]">
                                        Candidates
                                    </p>
                                    {e.candidates.length > 0 ? (
                                        <ul className="mt-1 space-y-1 text-xs text-[#bad5b9]">
                                            {e.candidates.map((candidate) => (
                                                <li key={candidate.id}>
                                                    {candidate.name} · {candidate.position} · {candidate.party_name || 'Independent'}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-1 text-xs text-amber-700">
                                            Add at least one candidate before opening voting.
                                        </p>
                                    )}
                                    <div className="mt-3 grid gap-2">
                                        <select
                                            aria-label={`Candidate for ${e.title}`}
                                            value={candidateForm(e).user_id}
                                            onChange={(event) =>
                                                setCandidateData((current) => ({
                                                    ...current,
                                                    [e.id]: {
                                                        ...candidateForm(e),
                                                        user_id: event.target.value,
                                                    },
                                                }))
                                            }
                                            className="w-full rounded-md border border-[#31583a] bg-[#102d19] px-2 py-1.5 text-xs text-[#f0f7ed]"
                                        >
                                            <option value="">Choose a candidate</option>
                                            {e.eligible_candidates.map((person) => (
                                                <option key={person.id} value={person.id}>
                                                    {person.name}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            aria-label={`Position for ${e.title}`}
                                            value={candidateForm(e).position}
                                            onChange={(event) =>
                                                setCandidateData((current) => ({
                                                    ...current,
                                                    [e.id]: {
                                                        ...candidateForm(e),
                                                        position: event.target.value,
                                                    },
                                                }))
                                            }
                                            className="w-full rounded-md border border-[#31583a] bg-[#102d19] px-2 py-1.5 text-xs text-[#f0f7ed]"
                                        >
                                            {e.positions.map((position) => (
                                                <option key={position}>{position}</option>
                                            ))}
                                        </select>
                                        <input
                                            aria-label={`Party-list for ${e.title}`}
                                            value={candidateForm(e).party_name}
                                            onChange={(event) =>
                                                setCandidateData((current) => ({
                                                    ...current,
                                                    [e.id]: {
                                                        ...candidateForm(e),
                                                        party_name: event.target.value,
                                                    },
                                                }))
                                            }
                                            placeholder="Party-list (leave blank if independent)"
                                            className="w-full rounded-md border border-[#31583a] bg-[#102d19] px-2 py-1.5 text-xs text-[#f0f7ed] placeholder:text-[#91ae92]"
                                        />
                                        <input
                                            aria-label={`Platform for ${e.title}`}
                                            value={candidateForm(e).platform}
                                            onChange={(event) =>
                                                setCandidateData((current) => ({
                                                    ...current,
                                                    [e.id]: {
                                                        ...candidateForm(e),
                                                        platform: event.target.value,
                                                    },
                                                }))
                                            }
                                            placeholder="Platform statement (optional)"
                                            className="w-full rounded-md border border-[#31583a] bg-[#102d19] px-2 py-1.5 text-xs text-[#f0f7ed] placeholder:text-[#91ae92]"
                                        />
                                        <button
                                            type="button"
                                            disabled={!candidateForm(e).user_id}
                                            onClick={() => addCandidate(e)}
                                            className="rounded-md border border-[#5d9367] bg-[#214b2c] px-3 py-1.5 text-xs font-semibold text-[#e4f1df] hover:bg-[#2b5d37] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Add candidate
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="mt-4">
                                {e.status === 'draft' && (
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => beginEdit(e)} className="rounded-md border px-3 py-1.5 text-xs font-semibold">
                                            Edit draft
                                        </button>
                                        <button onClick={() => action(e.id, 'open')} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
                                            Open voting
                                        </button>
                                    </div>
                                )}
                                {e.status === 'open' && (
                                    <button
                                        onClick={() => action(e.id, 'close')}
                                        className="rounded-md border px-3 py-1.5 text-xs font-semibold"
                                    >
                                        Close early
                                    </button>
                                )}
                                {e.status === 'closed' && (
                                    <button
                                        onClick={() =>
                                            action(e.id, 'publish-results')
                                        }
                                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                                    >
                                        Publish results
                                    </button>
                                )}
                                {e.status === 'expired' && (
                                    <button
                                        onClick={() => reschedule(e)}
                                        className="rounded-md border border-amber-600 px-3 py-1.5 text-xs font-semibold text-amber-700"
                                    >
                                        Change dates
                                    </button>
                                )}
                            </div>
                            {actionErrors[e.id] && (
                                <p className="mt-2 text-xs text-red-600" role="alert">
                                    {actionErrors[e.id]}
                                </p>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </CouncilLayout>
    );
}

function TimeHint({ value }: { value: string }) {
    if (!value) return null;

    const selected = new Date(value);
    if (Number.isNaN(selected.getTime())) return null;

    return (
        <p className="text-xs font-normal text-[#5B6478]">
            Selected:{' '}
            {selected.toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
                hour12: true,
            })}
        </p>
    );
}

function DateTimeField({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    const date = value.slice(0, 10);
    const [rawHour = '12', minute = '00'] = (
        value.split('T')[1] ?? '00:00'
    ).split(':');
    const hour24 = Number(rawHour);
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour = String(hour24 % 12 || 12).padStart(2, '0');
    const update = (next: {
        date?: string;
        hour?: string;
        minute?: string;
        period?: 'AM' | 'PM';
    }) => {
        const nextDate = next.date ?? date;
        const nextHour = Number(next.hour ?? hour);
        const nextMinute = next.minute ?? minute;
        const nextPeriod = next.period ?? period;
        const nextHour24 = (nextHour % 12) + (nextPeriod === 'PM' ? 12 : 0);

        onChange(
            nextDate
                ? `${nextDate}T${String(nextHour24).padStart(2, '0')}:${nextMinute}`
                : '',
        );
    };

    return (
        <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_4.5rem] gap-2">
            <input
                required
                type="date"
                aria-label="Date"
                className="rounded-lg border bg-transparent px-3 py-2"
                value={date}
                onChange={(event) => update({ date: event.target.value })}
            />
            <select
                aria-label="Hour"
                className="rounded-lg border bg-transparent px-2 py-2"
                value={hour}
                onChange={(event) => update({ hour: event.target.value })}
            >
                {Array.from({ length: 12 }, (_, index) => {
                    const option = String(index + 1).padStart(2, '0');
                    return <option key={option}>{option}</option>;
                })}
            </select>
            <select
                aria-label="Minute"
                className="rounded-lg border bg-transparent px-2 py-2"
                value={minute}
                onChange={(event) => update({ minute: event.target.value })}
            >
                {Array.from({ length: 60 }, (_, index) => {
                    const option = String(index).padStart(2, '0');
                    return <option key={option}>{option}</option>;
                })}
            </select>
            <select
                aria-label="AM or PM"
                className="rounded-lg border bg-transparent px-2 py-2"
                value={period}
                onChange={(event) =>
                    update({ period: event.target.value as 'AM' | 'PM' })
                }
            >
                <option>AM</option>
                <option>PM</option>
            </select>
        </div>
    );
}

function Field({
    label,
    children,
    error,
}: {
    label: string;
    children: React.ReactNode;
    error?: string;
}) {
    return (
        <label className="grid gap-1 text-sm font-medium">
            {label}
            <span className="[&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:px-3 [&>input]:py-2 [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:px-3 [&>select]:py-2 [&>select>option]:text-[#173a21]">
                {children}
            </span>
            {error && (
                <p
                    className="text-xs font-normal text-red-600 dark:text-red-400"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </label>
    );
}
