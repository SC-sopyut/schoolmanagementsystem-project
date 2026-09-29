import CouncilLayout from '@/layouts/council-layout';
import { read as markAnnouncementRead } from '@/routes/student/announcements';
import { Link, router } from '@inertiajs/react';
import { Megaphone } from 'lucide-react';

type Announcement = {
    id: number;
    title: string;
    body: string;
    audience: string;
    published_at: string;
    is_read: boolean;
    organization: { name: string } | null;
    author: { user: { name: string } | null } | null;
};

type PageData = {
    data: Announcement[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
};

export default function Announcements({
    announcements,
}: {
    announcements: PageData;
}) {
    return (
        <CouncilLayout title="Announcements">
            <div className="mb-5">
                <h2 className="text-2xl font-bold">Announcements</h2>
                <p className="text-sm text-[#5B6478]">
                    Updates from your organizations and the council.
                </p>
            </div>

            <div className="space-y-3">
                {announcements.data.length === 0 && (
                    <div className="rounded-xl border border-[#E1E4EA] bg-white px-5 py-12 text-center">
                        <Megaphone className="mx-auto h-8 w-8 text-[#7B8496]" />
                        <p className="mt-3 font-semibold">
                            No announcements yet
                        </p>
                        <p className="mt-1 text-sm text-[#5B6478]">
                            New updates will appear here.
                        </p>
                    </div>
                )}
                {announcements.data.map((announcement) => (
                    <article
                        key={announcement.id}
                        className={`rounded-xl border bg-white p-5 ${announcement.is_read ? 'border-[#E1E4EA]' : 'border-blue-200 shadow-sm'}`}
                    >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                                {!announcement.is_read && (
                                    <span
                                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600"
                                        aria-label="Unread"
                                    />
                                )}
                                <div>
                                    <h3 className="font-semibold">
                                        {announcement.title}
                                    </h3>
                                    <p className="mt-1 text-xs text-[#5B6478]">
                                        {announcement.audience ===
                                        'organization'
                                            ? (announcement.organization
                                                  ?.name ??
                                              'Organization members')
                                            : announcement.audience ===
                                                'all_students'
                                              ? 'Students in every organization'
                                              : announcement.audience ===
                                                  'all_officers'
                                                ? 'All officers'
                                                : 'Everyone'}
                                        {announcement.author?.user?.name &&
                                            ` · ${announcement.author.user.name}`}
                                        {' · '}
                                        {new Date(
                                            announcement.published_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {!announcement.is_read && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            markAnnouncementRead(
                                                announcement.id,
                                            ).url,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                    className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                                >
                                    Mark as read
                                </button>
                            )}
                        </div>
                        <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-[#344054]">
                            {announcement.body}
                        </p>
                    </article>
                ))}
            </div>

            {announcements.last_page > 1 && (
                <nav
                    aria-label="Announcement pages"
                    className="mt-5 flex flex-wrap justify-center gap-2"
                >
                    {announcements.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                className={`rounded-md border px-3 py-1.5 text-sm ${link.active ? 'border-blue-600 bg-blue-600 text-white' : 'border-[#E1E4EA] bg-white text-[#344054]'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={index}
                                className="rounded-md border border-[#E1E4EA] px-3 py-1.5 text-sm text-[#98A2B3]"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ),
                    )}
                </nav>
            )}
        </CouncilLayout>
    );
}
