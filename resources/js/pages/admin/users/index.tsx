import AdminLayout from '@/layouts/admin-layout';
import { Card, Pill } from '@/components/council/ui';
import { Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type UserRow = {
    id: number;
    name: string;
    email: string;
    type: string;
    organization: string;
    position: string | null;
    joined_at: string;
};
type Props = {
    users: {
        data: UserRow[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: { q: string };
};

export default function AdminUsers({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.q);

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(
            '/admin/users',
            { q: search.trim() },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function clearSearch() {
        setSearch('');
        router.get(
            '/admin/users',
            { q: '' },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <AdminLayout title="All users">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold">All users</h2>
                    <p className="mt-1 text-sm text-[#5B6478]">
                        {users.total} matching student and officer accounts
                    </p>
                </div>
            </div>
            <form
                onSubmit={submitSearch}
                className="mb-5 flex max-w-2xl items-center gap-2"
            >
                <label className="relative flex-1">
                    <span className="sr-only">Search users</span>
                    <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[#718574]" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name, email, role, or organization…"
                        className="h-10 w-full rounded-lg border border-[#d6e6d1] bg-white pr-10 pl-9 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            aria-label="Clear search"
                            className="absolute top-2 right-2 rounded p-1 text-[#718574] hover:bg-slate-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </label>
                <button
                    type="submit"
                    className="h-10 rounded-lg bg-[#176b35] px-4 text-sm font-semibold text-white hover:bg-[#125a2d]"
                >
                    Search
                </button>
            </form>
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-[#5B6478]">
                            <tr>
                                <th className="px-5 py-3">Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Organization</th>
                                <th className="pr-5">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E1E4EA]">
                            {users.data.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-5 py-3 font-medium">
                                        {user.name}
                                    </td>
                                    <td className="text-[#5B6478]">
                                        {user.email}
                                    </td>
                                    <td>
                                        <Pill
                                            tone={
                                                user.type === 'Officer'
                                                    ? 'blue'
                                                    : 'gray'
                                            }
                                        >
                                            {user.position ?? user.type}
                                        </Pill>
                                    </td>
                                    <td>{user.organization || '—'}</td>
                                    <td className="pr-5 text-[#5B6478]">
                                        {new Date(
                                            user.joined_at,
                                        ).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="p-8 text-center text-[#5B6478]"
                                    >
                                        {filters.q
                                            ? 'No user accounts match this search.'
                                            : 'No accounts yet.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
            {users.links.filter((link) => link.url).length > 1 && (
                <nav
                    aria-label="User pages"
                    className="mt-4 flex justify-end gap-1"
                >
                    {users.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url}
                                aria-label={
                                    index === 0
                                        ? 'Previous page'
                                        : index === users.links.length - 1
                                          ? 'Next page'
                                          : `User page ${link.label}`
                                }
                                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm ${link.active ? 'bg-[#101B33] text-white' : 'border border-[#E1E4EA] bg-white hover:bg-slate-50'}`}
                            >
                                {index === 0 ? (
                                    <ChevronLeft className="h-4 w-4" />
                                ) : index === users.links.length - 1 ? (
                                    <ChevronRight className="h-4 w-4" />
                                ) : (
                                    link.label
                                )}
                            </Link>
                        ) : null,
                    )}
                </nav>
            )}
        </AdminLayout>
    );
}
