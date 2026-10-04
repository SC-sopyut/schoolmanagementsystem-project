import { Card, timeAgo } from '@/components/council/ui';
import { FileClock, Trash2 } from 'lucide-react';

export type DeletedUpload = {
    id: number;
    name: string;
    actor: string;
    organization: string | null;
    versions: number;
    deleted_at: string;
};

export default function DeletedUploads({
    uploads,
}: {
    uploads: DeletedUpload[];
}) {
    return (
        <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
                <FileClock className="size-4 text-[#5B6478]" />
                <h3 className="font-semibold">Deleted uploads</h3>
            </div>
            {uploads.length === 0 ? (
                <p className="text-sm text-[#5B6478]">
                    No deleted uploads in your organizations.
                </p>
            ) : (
                <ul className="space-y-3">
                    {uploads.map((upload) => (
                        <li key={upload.id} className="flex gap-3">
                            <Trash2 className="mt-0.5 size-4 shrink-0 text-rose-600" />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium" title={upload.name}>
                                    {upload.name}
                                </p>
                                <p className="text-xs text-[#5B6478]">
                                    {upload.actor} · {upload.organization ?? 'Organization'} · {timeAgo(upload.deleted_at)}
                                </p>
                                <p className="text-xs text-[#5B6478]">
                                    {upload.versions} version{upload.versions === 1 ? '' : 's'} deleted
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}
