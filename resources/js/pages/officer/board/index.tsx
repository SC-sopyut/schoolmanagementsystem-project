import CouncilLayout from '@/layouts/council-layout';
import {
    Avatar,
    Field,
    Modal,
    Pill,
    btnGhost,
    btnPrimary,
    inputCls,
    priorityTone,
    shortDate,
    toneFor,
} from '@/components/council/ui';
import {
    status as updateStatus,
    store as storeTask,
} from '@/routes/officer/tasks';
import { router, useForm } from '@inertiajs/react';
import { Clock, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

type Task = {
    id: number;
    title: string;
    status: string;
    priority: string;
    due_date: string | null;
    committee: string | null;
    organization: string | null;
    assignee: { id: number; name: string } | null;
};
type Props = {
    columns: Record<string, Task[]>;
    committees: { id: number; name: string; organization_id: number; organization: string | null }[];
    assignees: { id: number; name: string; organization_id: number }[];
    can_manage_tasks: boolean;
    task_authority_scope: string;
};

const COLS: [string, string][] = [
    ['backlog', 'Backlog'],
    ['todo', 'To Do'],
    ['in_progress', 'In Progress'],
    ['review', 'Review'],
    ['done', 'Done'],
];

export default function Board({ columns, committees, assignees, can_manage_tasks, task_authority_scope }: Props) {
    const [cols, setCols] = useState(columns);
    const [priority, setPriority] = useState('all');
    const [assignee, setAssignee] = useState('all');
    const [dragId, setDragId] = useState<number | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => setCols(columns), [columns]); // server is the source of truth after every visit

    const visible = (t: Task) =>
        (priority === 'all' || t.priority === priority) &&
        (assignee === 'all' ||
            (assignee === 'none'
                ? !t.assignee
                : t.assignee?.id === Number(assignee)));

    // Drag a card to another column: optimistic move, then PATCH. TaskPolicy::updateStatus decides on the server.
    function drop(to: string) {
        if (dragId === null) return;
        const from = COLS.map(([k]) => k).find((k) =>
            cols[k].some((t) => t.id === dragId),
        )!;
        if (from === to) return setDragId(null);
        const card = cols[from].find((t) => t.id === dragId)!;
        setCols({
            ...cols,
            [from]: cols[from].filter((t) => t.id !== dragId),
            [to]: [{ ...card, status: to }, ...cols[to]],
        });
        router.patch(
            updateStatus(dragId).url,
            { status: to },
            { preserveScroll: true },
        );
        setDragId(null);
    }

    const allAssignees = Array.from(
        new Map(assignees.map((a) => [a.id, a])).values(),
    );

    return (
        <CouncilLayout title="Kanban Board">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E1E4EA] bg-white p-4">
                <div><h2 className="font-semibold">Officer tasking</h2><p className="mt-1 text-xs text-[#5B6478]">{can_manage_tasks ? `Assign work to organization members and officers within ${task_authority_scope}.` : 'You can update tasks assigned to you. Presidents and VPs Internal/External manage assignments.'}</p></div>
                {can_manage_tasks && <button type="button" onClick={() => setOpen(true)} disabled={committees.length === 0} className={btnPrimary + ' disabled:opacity-50'}><Plus className="h-4 w-4"/>Assign task</button>}
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-[#E1E4EA] bg-white px-3 py-1.5 text-xs">
                    Group by: Status
                </span>
                <select
                    className={inputCls + ' !w-auto !py-1.5 text-xs'}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <option value="all">Priority: All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select
                    className={inputCls + ' !w-auto !py-1.5 text-xs'}
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                >
                    <option value="all">Assignee: All</option>
                    <option value="none">Unassigned</option>
                    {allAssignees.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-24">
                {COLS.map(([key, label]) => {
                    const items = cols[key].filter(visible);
                    return (
                        <div
                            key={key}
                            className="w-64 shrink-0"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => drop(key)}
                        >
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                {label}{' '}
                                <span className="rounded-full bg-slate-200 px-2 text-[11px]">
                                    {items.length}
                                </span>
                            </div>
                            <div className="min-h-24 space-y-3 rounded-xl">
                                {items.map((t) => (
                                    <div
                                        key={t.id}
                                        draggable
                                        onDragStart={() => setDragId(t.id)}
                                        className="cursor-grab rounded-xl border border-[#E1E4EA] bg-white p-3 shadow-sm active:cursor-grabbing"
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            {t.committee ? (
                                                <Pill
                                                    tone={toneFor(t.committee)}
                                                    dot
                                                >
                                                    {t.organization ? `${t.organization} · ${t.committee}` : t.committee}
                                                </Pill>
                                            ) : (
                                                <span />
                                            )}
                                            <Pill
                                                tone={priorityTone(t.priority)}
                                                dot
                                                className="border-transparent bg-transparent"
                                            >
                                                {t.priority}
                                            </Pill>
                                        </div>
                                        <p className="mb-3 text-sm font-semibold">
                                            {t.title}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-[#5B6478]">
                                            <span className="flex items-center gap-1.5">
                                                {t.assignee ? (
                                                    <>
                                                        <Avatar
                                                            name={
                                                                t.assignee.name
                                                            }
                                                            size={20}
                                                        />
                                                        {t.assignee.name}
                                                    </>
                                                ) : (
                                                    'Unassigned'
                                                )}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {t.status === 'done'
                                                    ? 'Completed'
                                                    : shortDate(t.due_date)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {can_manage_tasks && <NewTask
                open={open}
                onClose={() => setOpen(false)}
                committees={committees}
                assignees={assignees}
            />}
        </CouncilLayout>
    );
}

function NewTask({
    open,
    onClose,
    committees,
    assignees,
}: { open: boolean; onClose: () => void } & Pick<
    Props,
    'committees' | 'assignees'
>) {
    const form = useForm({
        committee_id: String(committees[0]?.id ?? ''),
        title: '',
        description: '',
        priority: 'medium',
        assigned_to: '',
        due_date: '',
    });
    const committee = committees.find(
        (c) => String(c.id) === form.data.committee_id,
    );
    const members = assignees.filter(
        (a) => a.organization_id === committee?.organization_id,
    );

    function submit(e: React.FormEvent) {
        e.preventDefault();
        // committee_id lives in the URL (route-model bound + policy-checked), not the body.
        // eslint-disable-next-line no-unused-vars
        form.transform(({ committee_id: _committee_id, ...rest }) => rest);
        form.post(storeTask(Number(form.data.committee_id)).url, {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset(
                        'title',
                        'description',
                        'assigned_to',
                        'due_date',
                    );
                    onClose();
                },
            });
    }

    return (
        <Modal open={open} onClose={onClose} title="Assign Task to Officer or Member">
            <form onSubmit={submit} className="space-y-3">
                <Field label="Committee" error={form.errors.committee_id}>
                    <select
                        className={inputCls}
                        value={form.data.committee_id}
                        onChange={(e) => {
                            form.setData('committee_id', e.target.value);
                            form.setData('assigned_to', '');
                        }}
                    >
                        {committees.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.organization ? `${c.organization} · ${c.name}` : c.name}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Title" error={form.errors.title}>
                    <input
                        className={inputCls}
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                        required
                    />
                </Field>
                <Field label="Description" error={form.errors.description}>
                    <textarea
                        className={inputCls}
                        rows={3}
                        value={form.data.description}
                        onChange={(e) =>
                            form.setData('description', e.target.value)
                        }
                    />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Priority" error={form.errors.priority}>
                        <select
                            className={inputCls}
                            value={form.data.priority}
                            onChange={(e) =>
                                form.setData('priority', e.target.value)
                            }
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </Field>
                    <Field label="Due date" error={form.errors.due_date}>
                        <input
                            type="date"
                            className={inputCls}
                            value={form.data.due_date}
                            onChange={(e) =>
                                form.setData('due_date', e.target.value)
                            }
                        />
                    </Field>
                </div>
                <Field label="Assignee" error={form.errors.assigned_to}>
                    <select
                        className={inputCls}
                        value={form.data.assigned_to}
                        onChange={(e) =>
                            form.setData('assigned_to', e.target.value)
                        }
                    >
                        <option value="">Unassigned</option>
                        {members.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </Field>
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className={btnGhost}
                    >
                        Cancel
                    </button>
                    <button disabled={form.processing} className={btnPrimary}>
                        Assign task
                    </button>
                </div>
            </form>
        </Modal>
    );
}
