import CouncilLayout from '@/layouts/council-layout';
import { Avatar, Card, Field, Modal, Pill, btnGhost, btnPrimary, inputCls, toneFor } from '@/components/council/ui';
import { download, index as documentsIndex, store } from '@/routes/documents';
import { Link, useForm } from '@inertiajs/react';
import { Download, FileText, Folder, Sheet, Upload } from 'lucide-react';
import { useState } from 'react';

type Doc = { id: number; name: string; file_type: string; access_level: string; uploader: string | null; updated_at: string; version: number; size: number | null };
type Props = {
    folders: { id: number; name: string; organization_id: number; parent_id: number | null }[];
    folder_id: number | null; documents: Doc[]; selected_id: number | null;
    versions: { version: number; created_at: string; size: number; is_current: boolean }[];
    can_upload: boolean;
};

const TABS: [string, string, (t: string) => boolean][] = [
    ['All Files', 'all', () => true], ['PDFs', 'pdf', (t) => t === 'pdf'],
    ['Spreadsheets', 'sheet', (t) => ['xls', 'xlsx', 'csv'].includes(t)], ['Documents', 'doc', (t) => ['doc', 'docx'].includes(t)],
];
const FOLDER_COLOR: Record<string, string> = { orange: 'text-orange-500', purple: 'text-purple-500', red: 'text-red-500', gray: 'text-slate-500', green: 'text-emerald-500', blue: 'text-blue-500', yellow: 'text-amber-500' };
const kb = (n: number | null) => (n === null ? '' : n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');

export default function Documents({ folders, folder_id, documents, selected_id, versions, can_upload }: Props) {
    const [tab, setTab] = useState('all');
    const [open, setOpen] = useState(false);
    const folder = folders.find((f) => f.id === folder_id);
    const selected = documents.find((d) => d.id === selected_id);
    const shown = documents.filter((d) => TABS.find((t) => t[1] === tab)![2](d.file_type));
    const link = (params: Record<string, number | null>) =>
        documentsIndex().url + '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])).toString();

    return (
        <CouncilLayout title="Document Repository">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[220px_1fr_260px]">
                <Card className="p-4">
                    <h3 className="mb-3 text-sm font-semibold">File Directories</h3>
                    <ul className="space-y-1">
                        {folders.map((f) => (
                            <li key={f.id}>
                                <Link href={link({ folder: f.id })} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${f.id === folder_id ? 'bg-slate-100 font-semibold' : 'text-[#5B6478] hover:bg-slate-50'}`}>
                                    <Folder className={`h-4 w-4 ${FOLDER_COLOR[toneFor(f.name)]}`} /> <span className="truncate">{f.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Card>

                <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-[#5B6478]">Home › <b className="text-[#101B33]">{folder?.name ?? '—'}</b></p>
                        {can_upload && folder && <button onClick={() => setOpen(true)} className={btnPrimary}><Upload className="h-4 w-4" />Upload Document</button>}
                    </div>
                    <div className="mb-3 flex flex-wrap gap-2">
                        {TABS.map(([label, key]) => (
                            <button key={key} onClick={() => setTab(key)} className={`rounded-full border px-3 py-1 text-xs ${tab === key ? 'border-blue-600 bg-blue-600 text-white' : 'border-[#E1E4EA] bg-white text-[#5B6478]'}`}>{label}</button>
                        ))}
                    </div>
                    <Card className="overflow-x-auto">
                        <table className="w-full min-w-[520px] text-left text-sm">
                            <thead className="bg-[#F5F6F8] text-[11px] tracking-wide text-[#5B6478] uppercase"><tr><th className="p-3">Filename</th><th>Uploader</th><th>Date Modified</th><th>Access</th><th /></tr></thead>
                            <tbody>
                                {shown.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-[#5B6478]">No files here.</td></tr>}
                                {shown.map((d) => (
                                    <tr key={d.id} className={`border-t border-[#E1E4EA] ${d.id === selected_id ? 'bg-blue-50/50' : ''}`}>
                                        <td className="p-3">
                                            <Link href={link({ folder: folder_id, doc: d.id })} className="flex items-center gap-2 font-medium">
                                                {['xls', 'xlsx', 'csv'].includes(d.file_type) ? <Sheet className="h-4 w-4 text-emerald-600" /> : <FileText className="h-4 w-4 text-blue-600" />}
                                                <span>{d.name}<span className="block text-[10px] font-normal text-[#5B6478]">v{d.version} · {kb(d.size)}</span></span>
                                            </Link>
                                        </td>
                                        <td><span className="flex items-center gap-2"><Avatar name={d.uploader} size={22} />{d.uploader}</span></td>
                                        <td className="text-[#5B6478]">{new Date(d.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td><Pill tone={d.access_level === 'public' ? 'blue' : 'gray'}>{d.access_level === 'public' ? 'Public access' : 'Members only'}</Pill></td>
                                        <td className="pr-3"><a href={download(d.id).url} title="Download" className="text-[#5B6478] hover:text-blue-600"><Download className="h-4 w-4" /></a></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>

                <Card className="p-4">
                    <h3 className="text-sm font-semibold">Version History</h3>
                    <p className="mb-3 truncate text-xs text-[#5B6478]">{selected?.name ?? 'Select a file'}</p>
                    <ul className="space-y-3">
                        {versions.map((v) => (
                            <li key={v.version} className="flex gap-2">
                                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${v.is_current ? 'bg-blue-600' : 'bg-slate-300'}`} />
                                <div><p className="text-sm font-medium">v{v.version}{v.is_current && ' (Current)'}</p><p className="text-xs text-[#5B6478]">{new Date(v.created_at).toLocaleDateString()} · {kb(v.size)}</p></div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            {folder && <UploadModal open={open} onClose={() => setOpen(false)} folderId={folder.id} />}
        </CouncilLayout>
    );
}

function UploadModal({ open, onClose, folderId }: { open: boolean; onClose: () => void; folderId: number }) {
    const form = useForm<{ file: File | null; access_level: string }>({ file: null, access_level: 'org_only' });
    return (
        <Modal open={open} onClose={onClose} title="Upload Document">
            <form onSubmit={(e) => { e.preventDefault(); form.post(store(folderId).url, { forceFormData: true, onSuccess: () => { form.reset(); onClose(); } }); }} className="space-y-3">
                <Field label="File (PDF, Word, Excel, CSV, PNG/JPG — max 10 MB)" error={form.errors.file}>
                    <input type="file" className={inputCls} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg" onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)} required />
                </Field>
                <Field label="Access level" error={form.errors.access_level}>
                    <select className={inputCls} value={form.data.access_level} onChange={(e) => form.setData('access_level', e.target.value)}>
                        <option value="org_only">Members only (this organization)</option><option value="public">Public access (any signed-in user)</option>
                    </select>
                </Field>
                <p className="text-xs text-[#5B6478]">Uploading a file with the same name creates a new version.</p>
                <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className={btnGhost}>Cancel</button><button disabled={form.processing} className={btnPrimary}>Upload</button></div>
            </form>
        </Modal>
    );
}
