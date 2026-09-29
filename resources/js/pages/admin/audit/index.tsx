import AdminLayout from '@/layouts/admin-layout';
import { Card, timeAgo } from '@/components/council/ui';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
};

export default function AdminAuditIndex({ reveals }: Props) {
    return (
        <AdminLayout title="Identity audit log">
            <Head title="Identity audit log" />
            <div className="mb-5">
                <h2 className="text-xl font-semibold">Identity audit log</h2>
                <p className="mt-1 text-sm text-[#5B6478]">
                    Recorded access to identities behind anonymous concerns.
                </p>
            </div>
            <Card className="overflow-hidden">
                {reveals.data.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-[#5B6478]">
                        No identity reveals have been recorded.
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
            <nav
                aria-label="Audit pages"
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
                                      : `Page ${link.label}`
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
        </AdminLayout>
    );
}
