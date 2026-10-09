import AdminLayout from '@/layouts/admin-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Student = { id: number; name: string; email: string };
type Organization = { id: number; name: string };
type Membership = Student & { organizations: Organization[] };
type Officer = Student & { organizations: { id: number; name: string; is_primary: boolean }[] };

type Props = {
    students: Student[];
    officers: Officer[];
    organizations: Organization[];
    memberships: Membership[];
};

export default function OrganizationMemberships({
    students,
    officers,
    organizations,
    memberships,
}: Props) {
    const { flash } = usePage<{ flash?: { success?: string } }>().props;
    const studentForm = useForm({ user_id: '', organization_id: '' });
    const officerForm = useForm({ user_id: '', organization_id: '' });
    const [officerSearch, setOfficerSearch] = useState('');
    const matchingOfficers = officers.filter((officer) => {
        const query = officerSearch.trim().toLowerCase();
        return query === '' || [officer.name, officer.email, ...officer.organizations.map((organization) => organization.name)]
            .some((value) => value.toLowerCase().includes(query));
    });

    function addStudent(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        studentForm.transform((data) => ({ ...data, account_type: 'student' }));
        studentForm.post('/admin/memberships', {
            onSuccess: () => studentForm.reset('user_id', 'organization_id'),
        });
    }

    function addOfficer(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        officerForm.transform((data) => ({ ...data, account_type: 'officer' }));
        officerForm.post('/admin/memberships', {
            onSuccess: () => officerForm.reset('user_id', 'organization_id'),
        });
    }

    return (
        <AdminLayout title="Organization members">
            <h1 className="text-2xl font-bold">Organization members</h1>
            <p className="mt-1 mb-6 text-sm text-[#5B6478]">
                Students can belong to one organization. Officers can have additional organization affiliations.
            </p>
            {flash?.success && <p role="status" className="mb-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">{flash.success}</p>}

            <section className="rounded-xl border border-[#E1E4EA] bg-white p-5 shadow-sm">
                <h2 className="font-semibold">Add a student</h2>
                {students.length === 0 || organizations.length === 0 ? (
                    <p className="mt-3 text-sm text-[#5B6478]">{students.length === 0 ? 'There are no unassigned student accounts to add.' : 'Create an organization before adding students.'}</p>
                ) : (
                    <form onSubmit={addStudent} className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                        <label className="block text-sm font-medium">Student
                            <select value={studentForm.data.user_id} onChange={(event) => studentForm.setData('user_id', event.target.value)} className="mt-1.5 block h-10 w-full rounded-md border border-[#D5DAE3] bg-white px-3 text-sm" required>
                                <option value="">Choose a student</option>
                                {students.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.email}</option>)}
                            </select>
                            {studentForm.errors.user_id && <span className="mt-1 block text-xs text-red-600">{studentForm.errors.user_id}</span>}
                        </label>
                        <label className="block text-sm font-medium">Organization
                            <select value={studentForm.data.organization_id} onChange={(event) => studentForm.setData('organization_id', event.target.value)} className="mt-1.5 block h-10 w-full rounded-md border border-[#D5DAE3] bg-white px-3 text-sm" required>
                                <option value="">Choose an organization</option>
                                {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
                            </select>
                            {studentForm.errors.organization_id && <span className="mt-1 block text-xs text-red-600">{studentForm.errors.organization_id}</span>}
                        </label>
                        <button type="submit" disabled={studentForm.processing} className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{studentForm.processing ? 'Adding…' : 'Add student'}</button>
                    </form>
                )}
            </section>

            <section className="mt-6 rounded-xl border border-[#E1E4EA] bg-white p-5 shadow-sm">
                <h2 className="font-semibold">Add an organization for an officer</h2>
                <p className="mt-1 text-sm text-[#5B6478]">The officer keeps their primary role and gains access to the selected organization.</p>
                <label className="relative mt-4 block max-w-lg">
                    <span className="sr-only">Search officers and affiliations</span>
                    <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[#718574]" />
                    <input value={officerSearch} onChange={(event) => setOfficerSearch(event.target.value)} placeholder="Search officers or organizations…" className="h-10 w-full rounded-md border border-[#D5DAE3] bg-white pr-3 pl-9 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
                </label>
                {officers.length === 0 || organizations.length === 0 ? (
                    <p className="mt-3 text-sm text-[#5B6478]">There are no officer accounts to add.</p>
                ) : (
                    <form onSubmit={addOfficer} className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                        <label className="block text-sm font-medium">Officer
                            <select value={officerForm.data.user_id} onChange={(event) => officerForm.setData('user_id', event.target.value)} className="mt-1.5 block h-10 w-full rounded-md border border-[#D5DAE3] bg-white px-3 text-sm" required>
                                <option value="">Choose an officer</option>
                                {matchingOfficers.map((officer) => <option key={officer.id} value={officer.id}>{officer.name} · {officer.email}</option>)}
                            </select>
                            {officerForm.errors.user_id && <span className="mt-1 block text-xs text-red-600">{officerForm.errors.user_id}</span>}
                        </label>
                        <label className="block text-sm font-medium">Organization
                            <select value={officerForm.data.organization_id} onChange={(event) => officerForm.setData('organization_id', event.target.value)} className="mt-1.5 block h-10 w-full rounded-md border border-[#D5DAE3] bg-white px-3 text-sm" required>
                                <option value="">Choose an organization</option>
                                {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
                            </select>
                        </label>
                        <button type="submit" disabled={officerForm.processing} className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">Add affiliation</button>
                    </form>
                )}
                {officers.length > 0 && (matchingOfficers.length === 0 ? <p className="mt-4 text-sm text-[#5B6478]">No officers or affiliations match that search.</p> : <ul className="mt-4 divide-y divide-[#E1E4EA] text-sm">{matchingOfficers.map((officer) => <li key={officer.id} className="flex flex-wrap items-center justify-between gap-3 py-2"><span className="font-medium">{officer.name}</span><div className="flex flex-wrap justify-end gap-2">{officer.organizations.map((organization) => <span key={organization.id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs">{organization.name}{organization.is_primary ? <span className="text-[#5B6478]">· primary</span> : <button type="button" aria-label={`Remove ${organization.name} affiliation from ${officer.name}`} onClick={() => { if (window.confirm(`Remove ${officer.name} from ${organization.name}?`)) router.delete(`/admin/officer-affiliations/${officer.id}/${organization.id}`, { preserveScroll: true }); }} className="ml-1 rounded px-1 font-bold text-red-600 hover:bg-red-50 hover:text-red-800">×</button>}</span>)}</div></li>)}</ul>)}
            </section>

            <section className="mt-6 overflow-hidden rounded-xl border border-[#E1E4EA] bg-white shadow-sm">
                <div className="border-b border-[#E1E4EA] px-5 py-4"><h2 className="font-semibold">Current student memberships</h2></div>
                {memberships.length === 0 ? (
                    <p className="p-5 text-sm text-[#5B6478]">No students have been assigned to an organization yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#F8F9FB] text-xs tracking-wide text-[#5B6478] uppercase"><tr><th className="px-5 py-3 font-medium">Student</th><th className="px-5 py-3 font-medium">Email</th><th className="px-5 py-3 font-medium">Organizations</th></tr></thead>
                            <tbody className="divide-y divide-[#E1E4EA]">
                                {memberships.map((membership) => <tr key={membership.id}>
                                    <td className="px-5 py-3 font-medium">{membership.name}</td>
                                    <td className="px-5 py-3 text-[#5B6478]">{membership.email}</td>
                                    <td className="px-5 py-3"><div className="flex flex-wrap gap-2">{membership.organizations.map((organization) => <span key={organization.id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs">{organization.name}<button type="button" aria-label={`Remove ${membership.name} from ${organization.name}`} onClick={() => { if (window.confirm(`Remove ${membership.name} from ${organization.name}?`)) router.delete(`/admin/memberships/${membership.id}/${organization.id}`, { preserveScroll: true }); }} className="font-bold text-red-600 hover:text-red-800">×</button></span>)}</div></td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
