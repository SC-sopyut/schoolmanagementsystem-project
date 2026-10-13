import AdminLayout from '@/layouts/admin-layout';
import { Card } from '@/components/council/ui';
import { router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';

type StudentId = { id: number; student_id_no: string; created_at: string };

export default function StudentMasterlist({ studentIds }: { studentIds: StudentId[] }) {
    const form = useForm({ student_id_no: '' });

    function addId(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/admin/student-masterlist', { preserveScroll: true, onSuccess: () => form.reset() });
    }

    return <AdminLayout title="Student masterlist">
        <div className="mb-5">
            <h2 className="text-xl font-semibold">Student masterlist</h2>
            <p className="mt-1 text-sm text-[#5B6478]">Only School IDs in this list can create a student account.</p>
        </div>
        <Card className="mb-5 p-5">
            <form onSubmit={addId} className="flex max-w-lg flex-wrap gap-2">
                <div className="min-w-60 flex-1">
                    <label htmlFor="student_id_no" className="sr-only">School ID</label>
                    <input id="student_id_no" value={form.data.student_id_no} onChange={(event) => form.setData('student_id_no', event.target.value)} placeholder="2024-01-00001" pattern="[0-9]{4}-[0-9]{2}-[0-9]{5}" required className="h-10 w-full rounded-lg border border-[#D5DAE3] px-3 text-sm" />
                    {form.errors.student_id_no && <p className="mt-1 text-xs text-red-600">{form.errors.student_id_no}</p>}
                </div>
                <button disabled={form.processing} className="h-10 rounded-lg bg-[#176b35] px-4 text-sm font-semibold text-white hover:bg-[#125a2d] disabled:opacity-60">Add School ID</button>
            </form>
        </Card>
        <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-[#5B6478]"><tr><th className="px-5 py-3">School ID</th><th>Added</th><th className="pr-5 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-[#E1E4EA]">
                    {studentIds.map((studentId) => <tr key={studentId.id}><td className="px-5 py-3 font-mono">{studentId.student_id_no}</td><td className="text-[#5B6478]">{new Date(studentId.created_at).toLocaleDateString()}</td><td className="pr-5 text-right"><button type="button" onClick={() => { if (window.confirm(`Remove ${studentId.student_id_no} from the masterlist?`)) router.delete(`/admin/student-masterlist/${studentId.id}`, { preserveScroll: true }); }} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />Remove</button></td></tr>)}
                    {studentIds.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-[#5B6478]">No School IDs have been added yet.</td></tr>}
                </tbody>
            </table>
        </Card>
    </AdminLayout>;
}
