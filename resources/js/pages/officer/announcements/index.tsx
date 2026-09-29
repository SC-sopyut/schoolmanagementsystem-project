import CouncilLayout from '@/layouts/council-layout';
import { useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Organization = { id: number; name: string };
type Announcement = {
    id: number;
    title: string;
    body: string;
    audience: string;
    organization: string | null;
    author: string | null;
    published_at: string;
};

type Props = {
    organizations: Organization[];
    is_council_officer: boolean;
    announcements: Announcement[];
};

const audienceNames: Record<string, string> = {
    organization: 'Organization members',
    all_students: 'Students in every organization',
    all_officers: 'All officers',
    everyone: 'Everyone',
};

export default function OfficerAnnouncements({ organizations, is_council_officer, announcements }: Props) {
    const form = useForm({
        title: '',
        body: '',
        audience: 'organization',
        organization_id: organizations[0]?.id.toString() ?? '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/officer/announcements', {
            onSuccess: () => form.reset('title', 'body'),
        });
    }

    return (
        <CouncilLayout title="Announcements">
            <div className="mb-5">
                <h2 className="text-2xl font-bold">Announcements</h2>
                <p className="text-sm text-[#5B6478]">Share updates with the right people.</p>
            </div>

            <section className="rounded-xl border border-[#E1E4EA] bg-white p-5">
                <h3 className="font-semibold">Publish an announcement</h3>
                <p className="mt-1 text-xs text-[#5B6478]">
                    {is_council_officer
                        ? 'As an SSC officer, you can choose an organization or send to a wider audience.'
                        : `This announcement will be shared with members of ${organizations[0]?.name ?? 'your organization'}.`}
                </p>
                <form onSubmit={submit} className="mt-4 space-y-4">
                    <label className="block text-sm font-medium">
                        Title
                        <input value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} maxLength={150} required className="mt-1.5 h-10 w-full rounded-md border border-[#D5DAE3] px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
                        {form.errors.title && <span className="mt-1 block text-xs text-red-600">{form.errors.title}</span>}
                    </label>

                    {is_council_officer && (
                        <label className="block text-sm font-medium">
                            Send to
                            <select value={form.data.audience} onChange={(event) => form.setData('audience', event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-[#D5DAE3] bg-white px-3 text-sm">
                                <option value="organization">Members of a specific organization</option>
                                <option value="all_students">Students in every organization</option>
                                <option value="all_officers">Officers of every organization</option>
                                <option value="everyone">Everyone</option>
                            </select>
                            {form.errors.audience && <span className="mt-1 block text-xs text-red-600">{form.errors.audience}</span>}
                        </label>
                    )}

                    {form.data.audience === 'organization' && is_council_officer && (
                        <label className="block text-sm font-medium">
                            Organization
                            <select value={form.data.organization_id} onChange={(event) => form.setData('organization_id', event.target.value)} required className="mt-1.5 h-10 w-full rounded-md border border-[#D5DAE3] bg-white px-3 text-sm">
                                {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
                            </select>
                            {form.errors.organization_id && <span className="mt-1 block text-xs text-red-600">{form.errors.organization_id}</span>}
                        </label>
                    )}

                    <label className="block text-sm font-medium">
                        Message
                        <textarea value={form.data.body} onChange={(event) => form.setData('body', event.target.value)} maxLength={10000} rows={5} required className="mt-1.5 w-full resize-y rounded-md border border-[#D5DAE3] px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
                        {form.errors.body && <span className="mt-1 block text-xs text-red-600">{form.errors.body}</span>}
                    </label>

                    <div className="flex justify-end">
                        <button type="submit" disabled={form.processing || organizations.length === 0} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                            {form.processing ? 'Publishing…' : 'Publish announcement'}
                        </button>
                    </div>
                </form>
            </section>

            <section className="mt-6">
                <h3 className="mb-3 font-semibold">Recent announcements</h3>
                <div className="space-y-3">
                    {announcements.length === 0 && <p className="rounded-xl border border-[#E1E4EA] bg-white p-5 text-sm text-[#5B6478]">No announcements yet.</p>}
                    {announcements.map((announcement) => (
                        <article key={announcement.id} className="rounded-xl border border-[#E1E4EA] bg-white p-5">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <h4 className="font-semibold">{announcement.title}</h4>
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                    {announcement.audience === 'organization' ? `${audienceNames[announcement.audience]} · ${announcement.organization ?? 'Organization'}` : audienceNames[announcement.audience] ?? announcement.audience}
                                </span>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#344054]">{announcement.body}</p>
                            <p className="mt-3 text-xs text-[#7B8496]">{announcement.author ?? 'Officer'} · {new Date(announcement.published_at).toLocaleString()}</p>
                        </article>
                    ))}
                </div>
            </section>
        </CouncilLayout>
    );
}
