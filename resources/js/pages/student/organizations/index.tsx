import CouncilLayout from '@/layouts/council-layout';
import { Card } from '@/components/council/ui';
import { useForm } from '@inertiajs/react';
import { Building2, Send } from 'lucide-react';
import type { FormEvent } from 'react';

type Organization = { id: number; name: string };
type Request = {
    organization_id: number;
    organization: string;
    status: string;
    created_at: string;
};

export default function StudentOrganizations({
    memberships,
    organizations,
    requests,
}: {
    memberships: Organization[];
    organizations: Organization[];
    requests: Request[];
}) {
    const form = useForm({ organization_id: '' });
    const requestedIds = new Set(
        requests
            .filter((request) => request.status === 'pending')
            .map((request) => request.organization_id),
    );
    const memberIds = new Set(memberships.map((membership) => membership.id));
    const available = organizations.filter(
        (organization) =>
            !memberIds.has(organization.id) &&
            !requestedIds.has(organization.id),
    );

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/student/organizations/requests', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <CouncilLayout title="Organizations">
            <div className="mx-auto max-w-4xl space-y-5 pb-8">
                <div>
                    <p className="text-xs font-semibold tracking-[.16em] text-emerald-700 uppercase">
                        Student organizations
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-[#12351f]">
                        My organizations
                    </h1>
                    <p className="mt-1 text-sm text-[#64806a]">
                        Your department organization is assigned automatically
                        after account approval. You can request membership in
                        additional organizations.
                    </p>
                </div>
                <Card className="p-5">
                    <h2 className="mb-3 font-bold">Current memberships</h2>
                    {memberships.length ? (
                        <div className="flex flex-wrap gap-2">
                            {memberships.map((membership) => (
                                <span
                                    key={membership.id}
                                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900"
                                >
                                    <Building2 className="h-4 w-4" />
                                    {membership.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-[#64806a]">
                            Your department membership will appear here after
                            your registration is approved.
                        </p>
                    )}
                </Card>
                <Card className="p-5">
                    <h2 className="font-bold">Request another membership</h2>
                    <p className="mt-1 text-sm text-[#64806a]">
                        The president of the organization will review your
                        request.
                    </p>
                    {available.length ? (
                        <form
                            onSubmit={submit}
                            className="mt-4 flex max-w-lg flex-wrap gap-2"
                        >
                            <select
                                required
                                value={form.data.organization_id}
                                onChange={(event) =>
                                    form.setData(
                                        'organization_id',
                                        event.target.value,
                                    )
                                }
                                className="h-10 min-w-56 flex-1 rounded-lg border border-[#D5DAE3] bg-white px-3 text-sm"
                            >
                                <option value="" disabled>
                                    Select an organization
                                </option>
                                {available.map((organization) => (
                                    <option
                                        key={organization.id}
                                        value={organization.id}
                                    >
                                        {organization.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                disabled={form.processing}
                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#176b35] px-4 text-sm font-semibold text-white hover:bg-[#125a2d] disabled:opacity-60"
                            >
                                <Send className="h-4 w-4" />
                                Send request
                            </button>
                            {form.errors.organization_id && (
                                <p className="w-full text-xs text-red-600">
                                    {form.errors.organization_id}
                                </p>
                            )}
                        </form>
                    ) : (
                        <p className="mt-4 text-sm text-[#64806a]">
                            There are no additional organizations available to
                            request.
                        </p>
                    )}
                </Card>
                {requests.length > 0 && (
                    <Card className="p-5">
                        <h2 className="mb-3 font-bold">Request history</h2>
                        <div className="space-y-2">
                            {requests.map((request) => (
                                <div
                                    key={`${request.organization_id}-${request.created_at}`}
                                    className="flex items-center justify-between rounded-lg border border-[#e1e4ea] p-3 text-sm"
                                >
                                    <span className="font-medium">
                                        {request.organization}
                                    </span>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${request.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : request.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}
                                    >
                                        {request.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </CouncilLayout>
    );
}
