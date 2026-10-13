import AdminLayout from '@/layouts/admin-layout';
import { Card, Pill } from '@/components/council/ui';
import { Link, router } from '@inertiajs/react';
import { Check, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Registration = { user_id: number; student_id_no: string; name: string; email: string; course: string; year_level: number; registered_at: string };
type ApprovedStudent = { student_id_no: string; name: string; email: string; course: string; year_level: number; verified_at: string; verified_by: string };
type Pagination = { data: ApprovedStudent[]; links: { url: string | null; label: string; active: boolean }[]; total: number };

export default function PendingRegistrations({ registrations, approvedStudents, filters }: { registrations: Registration[]; approvedStudents: Pagination; filters: { q: string } }) {
    const [search, setSearch] = useState(filters.q);
    function approve(userId: number) {
        router.post(`/admin/pending-registrations/${userId}/approve`, {}, { preserveScroll: true });
    }

    function reject(userId: number) {
        if (window.confirm('Reject this registration? This deletes the pending account and releases its school ID for the rightful student.')) {
            router.delete(`/admin/pending-registrations/${userId}`, { preserveScroll: true });
        }
    }

    function approveAll() {
        if (window.confirm(`Approve all ${registrations.length} pending registration${registrations.length === 1 ? '' : 's'}? Confirm that their School IDs have been checked first.`)) {
            router.post('/admin/pending-registrations/approve-all', {}, { preserveScroll: true });
        }
    }

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/admin/pending-registrations', { q: search.trim() }, { preserveState: true, preserveScroll: true, replace: true });
    }

    function clearSearch() {
        setSearch('');
        router.get('/admin/pending-registrations', { q: '' }, { preserveState: true, preserveScroll: true, replace: true });
    }

    return <AdminLayout title="Pending registrations">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold">Pending registrations</h2><p className="mt-1 text-sm text-[#5B6478]">Compare these details with the school ID before approving the account.</p></div>{registrations.length > 0 && <button type="button" onClick={approveAll} className="inline-flex items-center gap-2 rounded-lg bg-[#176b35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#125a2d]"><Check className="h-4 w-4" />Approve all ({registrations.length})</button>}</div>
        <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-[#5B6478]"><tr><th className="px-5 py-3">School ID</th><th>Name</th><th>Course</th><th>Year</th><th>Email</th><th>Registered</th><th className="pr-5">Review</th></tr></thead>
            <tbody className="divide-y divide-[#E1E4EA]">{registrations.map((registration) => <tr key={registration.user_id}>
                <td className="px-5 py-3 font-mono text-xs">{registration.student_id_no}</td><td className="font-medium">{registration.name}</td><td>{registration.course}</td><td><Pill tone="gray">Year {registration.year_level}</Pill></td><td className="text-[#5B6478]">{registration.email}</td><td className="text-[#5B6478]">{new Date(registration.registered_at).toLocaleDateString()}</td>
                <td className="flex gap-2 py-3 pr-5"><button onClick={() => approve(registration.user_id)} className="inline-flex items-center gap-1 rounded-md bg-[#176b35] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#125a2d]"><Check className="h-3.5 w-3.5" />Approve</button><button onClick={() => reject(registration.user_id)} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"><X className="h-3.5 w-3.5" />Reject</button></td>
            </tr>)}{registrations.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-[#5B6478]">There are no registrations waiting for review.</td></tr>}</tbody>
        </table></div></Card>
        <section className="mt-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div><h2 className="text-xl font-semibold">Approved students</h2><p className="mt-1 text-sm text-[#5B6478]">{approvedStudents.total} approved student account{approvedStudents.total === 1 ? '' : 's'}.</p></div>
            </div>
            <form onSubmit={submitSearch} className="mb-5 flex max-w-2xl items-center gap-2">
                <label className="relative flex-1"><span className="sr-only">Search approved students</span><Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[#718574]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by School ID, name, email, or course…" className="h-10 w-full rounded-lg border border-[#d6e6d1] bg-white pr-10 pl-9 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />{search && <button type="button" onClick={clearSearch} aria-label="Clear search" className="absolute top-2 right-2 rounded p-1 text-[#718574] hover:bg-slate-100"><X className="h-4 w-4" /></button>}</label><button type="submit" className="h-10 rounded-lg bg-[#176b35] px-4 text-sm font-semibold text-white hover:bg-[#125a2d]">Search</button>
            </form>
            <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs text-[#5B6478]"><tr><th className="px-5 py-3">School ID</th><th>Name</th><th>Course</th><th>Year</th><th>Email</th><th>Approved</th><th className="pr-5">Approved by</th></tr></thead>
                <tbody className="divide-y divide-[#E1E4EA]">{approvedStudents.data.map((student) => <tr key={student.student_id_no}><td className="px-5 py-3 font-mono text-xs">{student.student_id_no}</td><td className="font-medium">{student.name}</td><td>{student.course}</td><td><Pill tone="green">Year {student.year_level}</Pill></td><td className="text-[#5B6478]">{student.email}</td><td className="text-[#5B6478]">{student.verified_at ? new Date(student.verified_at).toLocaleDateString() : '—'}</td><td className="pr-5">{student.verified_by}</td></tr>)}{approvedStudents.data.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-[#5B6478]">{filters.q ? 'No approved students match this search.' : 'No students have been approved yet.'}</td></tr>}</tbody>
            </table></div></Card>
            {approvedStudents.links.filter((link) => link.url).length > 1 && <nav aria-label="Approved student pages" className="mt-4 flex justify-end gap-1">{approvedStudents.links.map((link, index) => link.url ? <Link key={`${link.label}-${index}`} href={link.url} aria-label={index === 0 ? 'Previous page' : index === approvedStudents.links.length - 1 ? 'Next page' : `Approved student page ${link.label}`} className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm ${link.active ? 'bg-[#101B33] text-white' : 'border border-[#E1E4EA] bg-white hover:bg-slate-50'}`}>{index === 0 ? <ChevronLeft className="h-4 w-4" /> : index === approvedStudents.links.length - 1 ? <ChevronRight className="h-4 w-4" /> : link.label}</Link> : null)}</nav>}
        </section>
    </AdminLayout>;
}
