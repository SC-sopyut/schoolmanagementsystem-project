import CouncilLayout from '@/layouts/council-layout';
import {
    Card,
    Field,
    btnGhost,
    btnPrimary,
    inputCls,
} from '@/components/council/ui';
import { index as myConcerns, store } from '@/routes/student/concerns';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Check, CheckCircle2, Paperclip, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

type Props = { organizations: { id: number; name: string }[] };
const CATEGORIES = ['Facilities', 'Academics', 'Services', 'Safety', 'Other'];
const PRIORITIES: [string, string][] = [
    ['low', 'Low'],
    ['medium', 'Medium'],
    ['high', 'High'],
];
const STAGES = ['Received', 'Reviewing', 'In Progress', 'Resolved'];

function Stepper({ step }: { step: number }) {
    return (
        <div className="flex items-center gap-2 text-xs font-medium">
            {['Details', 'Review', 'Confirmed'].map((label, i) => {
                const n = i + 1;
                return (
                    <div key={label} className="flex items-center gap-2">
                        <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${step > n ? 'bg-blue-600 text-white' : step === n ? 'bg-blue-600 text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-[#5B6478]'}`}
                        >
                            {step > n ? <Check className="h-3.5 w-3.5" /> : n}
                        </span>
                        <span
                            className={
                                step >= n ? 'text-[#101B33]' : 'text-[#5B6478]'
                            }
                        >
                            {label}
                        </span>
                        {n < 3 && <span className="h-px w-8 bg-slate-300" />}
                    </div>
                );
            })}
        </div>
    );
}

/**
 * 3-step wizard (Details -> Review -> Confirmed) as one page with local step state.
 * Nothing is sent until "Submit Concern" on step 2; validation + org-membership are enforced server-side
 * (StoreConcernRequest + ConcernPolicy::create), the client checks below only save a round trip.
 */
export default function CreateConcern({ organizations }: Props) {
    const { flash } = usePage<{ flash?: { tracking_code?: string } }>().props;
    const [step, setStep] = useState(1);
    const [tracking, setTracking] = useState<string | null>(null);
    const form = useForm({
        organization_id: String(organizations[0]?.id ?? ''),
        subject: '',
        category: CATEGORIES[0],
        priority: 'medium',
        body: '',
        is_anonymous: false,
    });
    const org = organizations.find(
        (o) => String(o.id) === form.data.organization_id,
    );
    const ready =
        form.data.organization_id &&
        form.data.subject.trim() &&
        form.data.body.trim();

    function submit() {
        form.post(store().url, {
            preserveScroll: true,
            onSuccess: (page) => {
                setTracking(
                    (page.props as { flash?: { tracking_code?: string } }).flash
                        ?.tracking_code ??
                        flash?.tracking_code ??
                        null,
                );
                setStep(3);
            },
            onError: () => setStep(1), // show server-side validation messages on the form
        });
    }

    if (organizations.length === 0) {
        return (
            <CouncilLayout title="Submit a Concern">
                <Card className="p-8 text-center text-sm text-[#5B6478]">
                    You need to be a member of an organization before you can
                    submit a concern.
                </Card>
            </CouncilLayout>
        );
    }

    return (
        <CouncilLayout title="Submit a Concern">
            <div className="mx-auto max-w-3xl">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold">
                            {step === 1
                                ? 'Submit a Concern'
                                : step === 2
                                  ? 'Review your Concern'
                                  : 'Confirmation'}
                        </h2>
                        <p className="text-sm text-[#5B6478]">
                            {step === 1
                                ? 'Your voice matters — share feedback, report issues, or suggest improvements'
                                : step === 2
                                  ? 'Please verify all the details below before submitting.'
                                  : 'Review your submission receipt and live tracking information.'}
                        </p>
                    </div>
                    <Stepper step={step} />
                </div>

                {step === 1 && (
                    <Card className="space-y-4 p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field
                                label="Concern Title"
                                error={form.errors.subject}
                            >
                                <input
                                    className={inputCls}
                                    maxLength={150}
                                    value={form.data.subject}
                                    onChange={(e) =>
                                        form.setData('subject', e.target.value)
                                    }
                                />
                            </Field>
                            <Field
                                label="Category"
                                error={form.errors.category}
                            >
                                <select
                                    className={inputCls}
                                    value={form.data.category}
                                    onChange={(e) =>
                                        form.setData('category', e.target.value)
                                    }
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                        {/* Not in the Figma, but required: the concern is routed to one organization's officers. */}
                        <Field
                            label="Send to organization"
                            error={form.errors.organization_id}
                        >
                            <select
                                className={inputCls}
                                value={form.data.organization_id}
                                onChange={(e) =>
                                    form.setData(
                                        'organization_id',
                                        e.target.value,
                                    )
                                }
                            >
                                {organizations.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <div>
                            <span className="mb-1 block text-xs font-medium text-[#5B6478]">
                                Priority Level
                            </span>
                            <div className="flex gap-2">
                                {PRIORITIES.map(([k, l]) => (
                                    <button
                                        type="button"
                                        key={k}
                                        onClick={() =>
                                            form.setData('priority', k)
                                        }
                                        className={`rounded-lg border px-4 py-1.5 text-sm ${form.data.priority === k ? 'border-orange-400 bg-orange-50 font-semibold text-orange-600' : 'border-[#E1E4EA] text-[#5B6478]'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Field label="Description" error={form.errors.body}>
                            <textarea
                                rows={5}
                                maxLength={5000}
                                className={inputCls}
                                value={form.data.body}
                                onChange={(e) =>
                                    form.setData('body', e.target.value)
                                }
                            />
                        </Field>
                        <div className="flex items-center gap-2 rounded-lg border border-dashed border-[#E1E4EA] p-4 text-sm text-[#5B6478]">
                            <Paperclip className="h-4 w-4" /> Attachments —
                            coming soon
                        </div>
                        <label className="flex cursor-pointer items-center justify-between rounded-lg bg-[#F5F6F8] p-4">
                            <span>
                                <b className="block text-sm">
                                    Submit Anonymously
                                </b>
                                <span className="text-xs text-[#5B6478]">
                                    Your name and profile won't be visible to
                                    council officers. Only the concern details
                                    will be shared.
                                </span>
                            </span>
                            <input
                                type="checkbox"
                                className="h-5 w-5 accent-emerald-700"
                                checked={form.data.is_anonymous}
                                onChange={(e) =>
                                    form.setData(
                                        'is_anonymous',
                                        e.target.checked,
                                    )
                                }
                            />
                        </label>
                        <div className="flex justify-between">
                            <Link href={myConcerns().url} className={btnGhost}>
                                Cancel
                            </Link>
                            <button
                                disabled={!ready}
                                onClick={() => setStep(2)}
                                className={btnPrimary}
                            >
                                Next: Review
                            </button>
                        </div>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="p-6">
                        <div className="mb-4 flex justify-between">
                            <h3 className="font-semibold">
                                Concern Details Summary
                            </h3>
                            <button
                                onClick={() => setStep(1)}
                                className="text-sm font-medium text-blue-600"
                            >
                                Edit Details
                            </button>
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-[10px] font-semibold text-[#5B6478] uppercase">
                                    Title
                                </dt>
                                <dd className="font-semibold">
                                    {form.data.subject}
                                </dd>
                            </div>
                            <div className="flex gap-8">
                                <div>
                                    <dt className="text-[10px] font-semibold text-[#5B6478] uppercase">
                                        Category
                                    </dt>
                                    <dd>{form.data.category}</dd>
                                </div>
                                <div>
                                    <dt className="text-[10px] font-semibold text-[#5B6478] uppercase">
                                        Priority
                                    </dt>
                                    <dd className="capitalize">
                                        {form.data.priority}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-[10px] font-semibold text-[#5B6478] uppercase">
                                        Submission Privacy
                                    </dt>
                                    <dd>
                                        {form.data.is_anonymous
                                            ? 'Anonymous'
                                            : 'Identified'}
                                    </dd>
                                </div>
                            </div>
                            <div>
                                <dt className="text-[10px] font-semibold text-[#5B6478] uppercase">
                                    Description
                                </dt>
                                <dd className="whitespace-pre-wrap">
                                    {form.data.body}
                                </dd>
                            </div>
                        </dl>
                        <div className="mt-4 flex gap-2 rounded-lg bg-blue-50 p-3 text-xs text-[#5B6478]">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
                            <span>
                                By submitting, your concern will be sent to the
                                officers of <b>{org?.name}</b>.{' '}
                                {form.data.is_anonymous
                                    ? 'Your name will be hidden from officers.'
                                    : 'Officers will see your name.'}
                            </span>
                        </div>
                        <div className="mt-5 flex justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className={btnGhost}
                            >
                                Back
                            </button>
                            <button
                                disabled={form.processing}
                                onClick={submit}
                                className={btnPrimary}
                            >
                                Submit Concern
                            </button>
                        </div>
                    </Card>
                )}

                {step === 3 && (
                    <Card className="p-8 text-center">
                        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
                        <h3 className="mt-3 text-xl font-bold">
                            Concern Submitted Successfully!
                        </h3>
                        <p className="mx-auto mt-1 max-w-md text-sm text-[#5B6478]">
                            Thank you for contributing to your campus. Our
                            student officers have been alerted and will start
                            reviewing the details shortly.
                        </p>
                        <div className="mx-auto mt-5 max-w-sm rounded-xl bg-[#F5F6F8] p-4">
                            <p className="text-[10px] font-semibold tracking-wide text-[#5B6478] uppercase">
                                Your tracking number
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                                {tracking ?? '—'}
                            </p>
                        </div>
                        <p className="mt-6 text-[10px] font-semibold tracking-wide text-[#5B6478] uppercase">
                            Expected response stages
                        </p>
                        <div className="mx-auto mt-3 flex max-w-md items-center">
                            {STAGES.map((s, i) => (
                                <div
                                    key={s}
                                    className="flex flex-1 flex-col items-center gap-1 text-[11px]"
                                >
                                    <span
                                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-[#5B6478]'}`}
                                    >
                                        {i + 1}
                                    </span>
                                    {s}
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                onClick={() => {
                                    form.reset();
                                    setStep(1);
                                }}
                                className={btnGhost}
                            >
                                Submit Another
                            </button>
                            <Link
                                href={myConcerns().url}
                                className={btnPrimary}
                            >
                                Track My Concern
                            </Link>
                        </div>
                    </Card>
                )}
            </div>
        </CouncilLayout>
    );
}
