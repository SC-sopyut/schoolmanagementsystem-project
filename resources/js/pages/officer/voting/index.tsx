import { useState, type FormEvent } from 'react';
import { router } from '@inertiajs/react';
import CouncilLayout from '@/layouts/council-layout';
import { Card, Pill, shortDate, toneFor } from '@/components/council/ui';
import { Plus, X } from 'lucide-react';

type Election = {
    id: number;
    title: string;
    status: 'draft' | 'open' | 'closed';
    organization: string;
    starts_at: string;
    ends_at: string;
    candidates_count: number;
    votes_count: number;
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
    const action = (id: number, name: 'open' | 'close' | 'publish-results') =>
        router.post(`/officer/voting/${id}/${name}`);
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
                        <Field label="Election title">
                            <input
                                required
                                value={data.title}
                                onChange={(e) =>
                                    setData({ ...data, title: e.target.value })
                                }
                            />
                        </Field>
                        <Field label="Scope">
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
                        <Field label="Positions (separate with commas)">
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
                        <Field label="Starts">
                            <input
                                required
                                type="datetime-local"
                                value={data.starts_at}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        starts_at: e.target.value,
                                    })
                                }
                            />
                        </Field>
                        <Field label="Ends">
                            <input
                                required
                                type="datetime-local"
                                value={data.ends_at}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        ends_at: e.target.value,
                                    })
                                }
                            />
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
                            <div className="mt-4">
                                {e.status === 'draft' && (
                                    <button
                                        onClick={() => action(e.id, 'open')}
                                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                                    >
                                        Open voting
                                    </button>
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
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </CouncilLayout>
    );
}
function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="grid gap-1 text-sm font-medium">
            {label}
            <span className="[&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:px-3 [&>input]:py-2 [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:px-3 [&>select]:py-2">
                {children}
            </span>
        </label>
    );
}
