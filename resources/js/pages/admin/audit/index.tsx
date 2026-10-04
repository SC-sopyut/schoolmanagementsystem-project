import AdminLayout from '@/layouts/admin-layout';
import { Card, timeAgo } from '@/components/council/ui';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Reveal = {
    id: number;
    admin: string | null;
    viewed_at: string;
    tracking_code: string | null;
    subject: string | null;
};
type Props = {
    reveals: {
        data: Reveal[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    activity: { data: { id: number; action: string; actor: string; organization: string | null; subject_type: string; subject_id: number | null; metadata: Record<string, unknown> | null; ip_address: string | null; created_at: string }[]; links: { url: string | null; label: string; active: boolean }[] };
    filters: { q: string };
};

export default function AdminAuditIndex({ reveals, activity, filters }: Props) {
    const [search, setSearch] = useState(filters.q);

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/admin/audit', { q: search.trim() }, { preserveState: true, preserveScroll: true, replace: true });
    }

    function clearSearch() {
        setSearch('');
        router.get('/admin/audit', { q: '' }, { preserveState: true, preserveScroll: true, replace: true });
    }

    return (
        <AdminLayout title="Audit log">
            <Head title="Audit log" />
            <div className="mb-5">
                <h2 className="text-xl font-semibold">Audit log</h2>
                <p className="mt-1 text-sm text-[#5B6478]">
                    Search identity reveals and system activity by person, action, organization, details, or IP address.
                </p>
            </div>
            <form onSubmit={submitSearch} className="mb-5 flex max-w-2xl items-center gap-2">
                <label className="relative flex-1">
                    <span className="sr-only">Search audit logs</span>
                    <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[#718574]" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, action, organization, details, IP…" className="h-10 w-full rounded-lg border border-[#d6e6d1] bg-white pr-10 pl-9 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
                    {search && <button type="button" onClick={clearSearch} aria-label="Clear search" className="absolute top-2 right-2 rounded p-1 text-[#718574] hover:bg-slate-100"><X className="h-4 w-4"/></button>}
                </label>
                <button type="submit" className="h-10 rounded-lg bg-[#176b35] px-4 text-sm font-semibold text-white hover:bg-[#125a2d]">Search</button>
            </form>
            {filters.q && <p className="mb-4 text-xs text-[#718574]">Showing results for <strong className="text-foreground">{filters.q}</strong> across both audit sections.</p>}
            <Card className="overflow-hidden">
                {reveals.data.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-[#5B6478]">
                        {filters.q ? 'No identity reveal records match this search.' : 'No identity reveals have been recorded.'}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-[#E1E4EA] bg-slate-50 text-xs text-[#5B6478]">
                                <tr>
                                    <th className="px-5 py-3 font-medium">
                                        Administrator
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Concern
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Tracking code
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Viewed
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E1E4EA]">
                                {reveals.data.map((reveal) => (
                                    <tr key={reveal.id}>
                                        <td className="px-5 py-3">
                                            {reveal.admin ?? 'Deleted admin'}
                                        </td>
                                        <td className="max-w-sm truncate px-5 py-3">
                                            {reveal.subject ??
                                                'Deleted concern'}
                                        </td>
                                        <td className="px-5 py-3 font-medium whitespace-nowrap text-blue-700">
                                            {reveal.tracking_code ?? '—'}
                                        </td>
                                        <td
                                            className="px-5 py-3 whitespace-nowrap text-[#5B6478]"
                                            title={new Date(
                                                reveal.viewed_at,
                                            ).toLocaleString()}
                                        >
                                            {timeAgo(reveal.viewed_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
            {reveals.links.filter((link) => link.url).length > 1 && (
                <nav
                    aria-label="Identity reveal pages"
                    className="mt-4 flex items-center justify-end gap-1"
                >
                    {reveals.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url}
                                aria-label={
                                    index === 0
                                        ? 'Previous page'
                                        : index === reveals.links.length - 1
                                          ? 'Next page'
                                          : `Identity reveal page ${link.label}`
                                }
                                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm ${link.active ? 'bg-[#101B33] text-white' : 'border border-[#E1E4EA] bg-white text-[#101B33] hover:bg-slate-50'}`}
                            >
                                {index === 0 ? (
                                    <ChevronLeft className="h-4 w-4" />
                                ) : index === reveals.links.length - 1 ? (
                                    <ChevronRight className="h-4 w-4" />
                                ) : (
                                    link.label
                                )}
                            </Link>
                        ) : null,
                    )}
                </nav>
            )}
            <div className="mb-3 mt-8"><h2 className="text-xl font-semibold">System activity</h2><p className="mt-1 text-sm text-[#5B6478]">Recorded document and task changes, including who made them and when.</p></div>
            <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-[#E1E4EA] bg-slate-50 text-xs text-[#5B6478]"><tr><th className="px-5 py-3">Action</th><th>Actor</th><th>Organization</th><th>Details</th><th>IP address</th><th className="pr-5">When</th></tr></thead><tbody className="divide-y divide-[#E1E4EA]">{activity.data.map((entry) => <tr key={entry.id}><td className="px-5 py-3 font-medium">{entry.action.replaceAll('.', ' ')}</td><td>{entry.actor}</td><td>{entry.organization ?? '—'}</td><td>{String(entry.metadata?.name ?? entry.metadata?.title ?? (entry.subject_type ? `${entry.subject_type} #${entry.subject_id}` : '—'))}{entry.metadata?.from !== undefined && ` · ${String(entry.metadata.from)} → ${String(entry.metadata.to)}`}{entry.metadata?.access_level !== undefined && ` · ${String(entry.metadata.access_level)}`}</td><td className="text-[#5B6478]">{entry.ip_address ?? '—'}</td><td className="pr-5 whitespace-nowrap text-[#5B6478]" title={new Date(entry.created_at).toLocaleString()}>{timeAgo(entry.created_at)}</td></tr>)}{activity.data.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-[#5B6478]">{filters.q ? 'No system activity records match this search.' : 'No system activity recorded yet.'}</td></tr>}</tbody></table></div></Card>
            {activity.links.filter((link) => link.url).length > 1 && (
                <nav aria-label="System activity pages" className="mt-4 flex justify-end gap-1">{activity.links.map((link, index) => link.url ? <Link key={`${link.label}-${index}`} href={link.url} aria-label={index === 0 ? 'Previous page' : index === activity.links.length - 1 ? 'Next page' : `Activity page ${link.label}`} className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm ${link.active ? 'bg-[#101B33] text-white' : 'border border-[#E1E4EA] bg-white hover:bg-slate-50'}`}>{index === 0 ? <ChevronLeft className="h-4 w-4"/> : index === activity.links.length - 1 ? <ChevronRight className="h-4 w-4"/> : link.label}</Link> : null)}</nav>
            )}
        </AdminLayout>
    );
}
