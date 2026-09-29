<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentFolder;
use App\Models\FeedItem;
use App\Models\Organization;
use App\Support\OrgScope;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $memberOrgIds = OrgScope::idsFor($user);

        // Every organization gets a root folder the first time anyone opens the repository.
        Organization::whereNotIn('id', DocumentFolder::whereNull('parent_id')->pluck('organization_id'))
            ->get()->each(fn ($o) => DocumentFolder::create(['organization_id' => $o->id, 'name' => $o->name . ' Documents']));

        $folders = DocumentFolder::orderBy('name')->get(['id', 'name', 'organization_id', 'parent_id']);
        $folder = $folders->firstWhere('id', $request->integer('folder')) ?? $folders->whereIn('organization_id', $memberOrgIds)->first() ?? $folders->first();

        // Visibility rule lives in SQL: public docs for everyone, org_only only for that org's people.
        $documents = $folder
            ? Document::where('folder_id', $folder->id)
                ->when(! $memberOrgIds->contains($folder->organization_id), fn ($q) => $q->where('access_level', 'public'))
                ->with(['uploader:id,name', 'versions'])->latest('updated_at')->get()
            : collect();

        $selected = $documents->firstWhere('id', $request->integer('doc')) ?? $documents->first();

        return Inertia::render('documents/index', [
            'folders' => $folders,
            'folder_id' => $folder?->id,
            'documents' => $documents->map(fn (Document $d) => [
                'id' => $d->id, 'name' => $d->name, 'file_type' => $d->file_type,
                'access_level' => $d->access_level, 'uploader' => $d->uploader?->name,
                'updated_at' => $d->updated_at, 'version' => $d->current_version,
                'size' => $d->versions->firstWhere('version', $d->current_version)?->size,
            ]),
            'selected_id' => $selected?->id,
            'versions' => $selected ? $selected->versions->map(fn ($v) => [
                'version' => $v->version, 'created_at' => $v->created_at,
                'size' => $v->size, 'is_current' => $v->version === $selected->current_version,
            ])->values() : [],
            'can_upload' => $folder ? $user->can('upload', $folder) : false,
        ]);
    }

    /**
     * Upload = new document, or a new version when the same filename already exists in the folder.
     * Stored on the private (non-public) disk under a server-generated name; the client filename is
     * only kept as display text, so it can never influence a filesystem path.
     */
    public function store(Request $request, DocumentFolder $folder): RedirectResponse
    {
        $this->authorize('upload', $folder);

        $data = $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:pdf,doc,docx,xls,xlsx,csv,png,jpg,jpeg'],
            'access_level' => ['required', Rule::in(Document::ACCESS_LEVELS)],
        ]);

        $file = $data['file'];
        $displayName = Str::limit(basename($file->getClientOriginalName()), 150, '');
        $path = $file->storeAs('documents/' . $folder->id, Str::uuid() . '.' . $file->extension(), 'local');

        DB::transaction(function () use ($request, $folder, $data, $file, $displayName, $path) {
            $doc = Document::where('folder_id', $folder->id)->where('name', $displayName)->lockForUpdate()->first();
            $version = ($doc?->current_version ?? 0) + 1;

            $doc ??= Document::create([
                'folder_id' => $folder->id, 'name' => $displayName, 'file_type' => strtolower($file->extension()),
                'access_level' => $data['access_level'], 'current_version' => 1, 'uploaded_by' => $request->user()->id,
            ]);
            $doc->update(['current_version' => $version, 'access_level' => $data['access_level']]);

            $doc->versions()->create([
                'version' => $version, 'path' => $path, 'size' => $file->getSize(),
                'uploaded_by' => $request->user()->id, 'created_at' => now(),
            ]);

            FeedItem::record($request->user(), $folder->organization_id, "uploaded \"{$displayName}\"");
        });

        return back()->with('success', 'Document uploaded.');
    }

    public function download(Document $document): StreamedResponse
    {
        Gate::authorize('view', $document);
        $version = $document->versions()->where('version', $document->current_version)->firstOrFail();

        return Storage::disk('local')->download($version->path, $document->name);
    }
}
