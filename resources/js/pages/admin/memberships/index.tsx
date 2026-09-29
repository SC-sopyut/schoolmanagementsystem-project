import AdminLayout from '@/layouts/admin-layout';
import { useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Student = { id: number; name: string; email: string };
type Organization = { id: number; name: string };
type Membership = Student & { organizations: string[] };

type Props = {
    students: Student[];
    organizations: Organization[];
    memberships: Membership[];
};

export default function OrganizationMemberships({ students, organizations, memberships }: Props) {
    const { flash } = usePage<{ flash?: { success?: string } }>().props;
    const form = useForm({ user_id: '', organization_id: '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/admin/memberships', { onSuccess: () => form.reset('user_id', 'organization_id') });
    }

    return (
        <AdminLayout title="Organization members">
            <h1 className="text-2xl font-bold">Organization members</h1>
            <p className="mb-6 mt-1 text-sm text-[#5B6478]">Add student accounts to one or more organizations.</p>

            <section className="rounded-xl border border-[#E1E4EA] bg-white p-5 shadow-sm">
                <h2 className="font-semibold">Add a student</h2>
                {flash?.success && <p role="status" className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{flash.success}</p>}
                {students.length === 0 || organizations.length === 0 ? (
                    <p className="mt-3 text-sm text-[#5B6478]">
                        {students.length === 0 ? 'There are no student accounts to add.' : 'Create an organization before adding members.'}
                    </p>
                ) : (
                    <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                        <label className="block text-sm font-medium">
                            Student
                            <select value={form.data.user_id} onChange={(event) => form.setData('user_id', event.target.value)} className="mt-1.5 block h-10 w-full rounded-md border border-[#D5DAE3] bg-white px-3 text-sm" required>
                                <option value="">Choose a student</option>
                                {students.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.email}</option>)}
                            </select>
                            {form.errors.user_id && <span className="mt-1 block text-xs text-red-600">{form.errors.user_id}</span>}
                        </label>
                        <label className="block text-sm font-medium">
                            Organization
                            <select value={form.data.organization_id} onChange={(event) => form.setData('organization_id', event.target.value)} className="mt-1.5 block h-10 w-full rounded-md border border-[#D5DAE3] bg-white px-3 text-sm" required>
                                <option value="">Choose an organization</option>
                                {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
                            </select>
                            {form.errors.organization_id && <span className="mt-1 block text-xs text-red-600">{form.errors.organization_id}</span>}
                        </label>
                        <button type="submit" disabled={form.processing} className="h-10 rounded-md bg-[#1E56C5] px-4 text-sm font-semibold text-white hover:bg-[#1949A7] disabled:opacity-60">
                            {form.processing ? 'Adding…' : 'Add member'}
                        </button>
                    </form>
                )}
            </section>

            <section className="mt-6 overflow-hidden rounded-xl border border-[#E1E4EA] bg-white shadow-sm">
                <div className="border-b border-[#E1E4EA] px-5 py-4">
                    <h2 className="font-semibold">Current student memberships</h2>
                </div>
                {memberships.length === 0 ? (
                    <p className="p-5 text-sm text-[#5B6478]">No students have been assigned to an organization yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#F8F9FB] text-xs uppercase tracking-wide text-[#5B6478]">
                                <tr><th className="px-5 py-3 font-medium">Student</th><th className="px-5 py-3 font-medium">Email</th><th className="px-5 py-3 font-medium">Organizations</th></tr>
                            </thead>
                            <tbody className="divide-y divide-[#E1E4EA]">
                                {memberships.map((membership) => (
                                    <tr key={membership.id}>
                                        <td className="px-5 py-3 font-medium">{membership.name}</td>
                                        <td className="px-5 py-3 text-[#5B6478]">{membership.email}</td>
                                        <td className="px-5 py-3">{membership.organizations.join(', ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
