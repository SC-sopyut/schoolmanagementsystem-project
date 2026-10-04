<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
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
use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $memberOrgIds = OrgScope::idsFor($user);

        // Every organization gets a root folder the first time anyone opens the repository.
        Organization::whereNotIn('id', DocumentFolder::whereNull('parent_id')->pluck('organization_id'))
            ->get()->each(fn ($o) => DocumentFolder::create(['organization_id' => $o->id, 'name' => $o->name.' Documents']));

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
                'preview_url' => route('documents.preview', $d),
                'can_manage' => $user->can('manage', $d),
            ]),
            'selected_id' => $selected?->id,
            'versions' => $selected ? $selected->versions->map(fn ($v) => [
                'version' => $v->version, 'created_at' => $v->created_at,
                'size' => $v->size, 'is_current' => $v->version === $selected->current_version,
            ])->values() : [],
            'deleted_uploads' => AuditLog::query()
                ->where('action', 'document.deleted')
                ->where('subject_type', Document::class)
                ->whereIn('organization_id', $memberOrgIds)
                ->with(['actor', 'organization:id,name'])
                ->recent()->limit(10)->get()
                ->map(fn (AuditLog $log) => [
                    'id' => $log->id,
                    'name' => $log->metadata['name'] ?? 'Deleted document',
                    'versions' => (int) ($log->metadata['versions'] ?? 1),
                    'actor' => $log->actor?->name ?? 'Unknown user',
                    'organization' => $log->organization?->name,
                    'deleted_at' => $log->created_at,
                ]),
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
            'file' => ['required', 'file', 'max:25600', 'mimes:pdf,doc,docx,xls,xlsx,csv,ppt,pptx,txt,png,jpg,jpeg'],
            'access_level' => ['required', Rule::in(Document::ACCESS_LEVELS)],
        ]);

        $file = $data['file'];
        $displayName = Str::limit(basename($file->getClientOriginalName()), 150, '');
        $path = $file->storeAs('documents/'.$folder->id, Str::uuid().'.'.$file->extension(), 'local');

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
            AuditLog::create(['actor_type' => $request->user()->getMorphClass(), 'actor_id' => $request->user()->id, 'action' => 'document.uploaded', 'subject_type' => Document::class, 'subject_id' => $doc->id, 'organization_id' => $folder->organization_id, 'metadata' => ['name' => $displayName, 'version' => $version, 'access_level' => $data['access_level']], 'ip_address' => $request->ip()]);
        });

        return back()->with('success', 'Document uploaded.');
    }

    public function download(Document $document): StreamedResponse
    {
        Gate::authorize('view', $document);
        $version = $document->versions()->where('version', $document->current_version)->firstOrFail();

        return Storage::disk('local')->download($version->path, $document->name);
    }

    public function preview(Document $document): HttpResponse|StreamedResponse
    {
        Gate::authorize('view', $document);
        $version = $document->versions()->where('version', $document->current_version)->firstOrFail();

        if (in_array($document->file_type, ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'txt'], true)) {
            $html = $this->officePreview($document->file_type, Storage::disk('local')->path($version->path), $document->name);

            return response($html, 200, [
                'Content-Type' => 'text/html; charset=UTF-8',
                'Content-Security-Policy' => "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control' => 'private, no-store',
            ]);
        }

        $mime = match ($document->file_type) {
            'pdf' => 'application/pdf', 'png' => 'image/png', 'jpg', 'jpeg' => 'image/jpeg', default => 'application/octet-stream',
        };

        return Storage::disk('local')->response($version->path, $document->name, [
            'Content-Type' => $mime,
            'Content-Disposition' => HeaderUtils::makeDisposition('inline', $document->name),
        ]);
    }

    /** Render safe, text-first previews for formats that browsers do not display natively. */
    private function officePreview(string $type, string $path, string $name): string
    {
        $title = e($name);
        $body = match ($type) {
            'docx' => $this->previewDocx($path),
            'xlsx' => $this->previewXlsx($path),
            'pptx' => $this->previewPptx($path),
            'csv' => $this->previewCsv($path),
            'txt' => '<pre>'.e(file_get_contents($path) ?: '').'</pre>',
            default => '<p class="empty">This legacy Office file cannot be displayed in the browser. Download it to view the original.</p>',
        };

        return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'.$title.'</title><style>
            *{box-sizing:border-box}body{margin:0;padding:18px;color:#172033;background:#fff;font:14px/1.55 system-ui,-apple-system,Segoe UI,sans-serif}h1{font-size:18px;margin:0 0 14px}h2{font-size:15px;margin:18px 0 8px}p{margin:0 0 9px;white-space:pre-wrap}pre{white-space:pre-wrap;overflow-wrap:anywhere}section{margin:0 0 18px}table{border-collapse:collapse;width:100%;margin:10px 0 20px}td,th{border:1px solid #cbd5e1;padding:6px 8px;vertical-align:top;min-width:40px}tr:nth-child(even){background:#f1f5f9}.empty{color:#475569}
        </style></head><body><h1>'.$title.'</h1>'.$body.'</body></html>';
    }

    private function previewDocx(string $path): string
    {
        $zip = $this->openOfficeArchive($path);
        $xml = $zip?->getFromName('word/document.xml');
        $zip?->close();
        $document = $this->loadOfficeXml($xml);
        if (! $document) return '<p class="empty">This Word file could not be previewed. Download it to view the original.</p>';

        $xpath = new \DOMXPath($document);
        $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');
        $paragraphs = $xpath->query('//w:body/w:p | //w:body/w:tbl/w:tr/w:tc/w:p');
        $items = [];
        foreach ($paragraphs ?: [] as $paragraph) {
            $text = '';
            foreach ($xpath->query('.//w:t', $paragraph) ?: [] as $node) $text .= $node->textContent;
            if (trim($text) !== '') $items[] = '<p>'.e($text).'</p>';
        }

        return $items ? implode('', $items) : '<p class="empty">This Word file contains no readable text.</p>';
    }

    private function previewPptx(string $path): string
    {
        $zip = $this->openOfficeArchive($path);
        if (! $zip) return '<p class="empty">This presentation could not be previewed. Download it to view the original.</p>';
        $slides = [];
        $slidePaths = [];
        for ($index = 0; $index < $zip->numFiles; $index++) {
            $entry = $zip->getNameIndex($index);
            if (is_string($entry) && preg_match('/^ppt\/slides\/slide[0-9]+\.xml$/', $entry)) $slidePaths[] = $entry;
        }
        natsort($slidePaths);
        foreach ($slidePaths as $slidePath) {
            $xml = $zip->getFromName($slidePath);
            if ($xml === false) continue;
            $document = $this->loadOfficeXml($xml);
            if (! $document) continue;
            $xpath = new \DOMXPath($document);
            $xpath->registerNamespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main');
            $paragraphs = [];
            foreach ($xpath->query('//a:p') ?: [] as $paragraph) {
                $text = '';
                foreach ($xpath->query('.//a:t', $paragraph) ?: [] as $node) $text .= $node->textContent;
                if (trim($text) !== '') $paragraphs[] = '<p>'.e($text).'</p>';
            }
            $slides[] = '<section><h2>Slide '.$index.'</h2>'.($paragraphs ? implode('', $paragraphs) : '<p class="empty">No readable text on this slide.</p>').'</section>';
        }
        $zip->close();

        return $slides ? implode('', $slides) : '<p class="empty">This presentation contains no readable slides.</p>';
    }

    private function previewXlsx(string $path): string
    {
        $zip = $this->openOfficeArchive($path);
        if (! $zip) return '<p class="empty">This spreadsheet could not be previewed. Download it to view the original.</p>';
        $sharedXml = $zip->getFromName('xl/sharedStrings.xml');
        $sharedDoc = $this->loadOfficeXml($sharedXml);
        $sharedStrings = [];
        if ($sharedDoc) {
            $sharedXPath = new \DOMXPath($sharedDoc);
            foreach ($sharedXPath->query('//*[local-name()="si"]') ?: [] as $item) {
                $value = '';
                foreach ($sharedXPath->query('.//*[local-name()="t"]', $item) ?: [] as $node) $value .= $node->textContent;
                $sharedStrings[] = $value;
            }
        }

        $sheets = [];
        $sheetPaths = [];
        for ($index = 0; $index < $zip->numFiles; $index++) {
            $entry = $zip->getNameIndex($index);
            if (is_string($entry) && preg_match('/^xl\/worksheets\/sheet[0-9]+\.xml$/', $entry)) $sheetPaths[] = $entry;
        }
        natsort($sheetPaths);
        foreach ($sheetPaths as $sheetPath) {
            $sheet = $this->loadOfficeXml($zip->getFromName($sheetPath));
            if (! $sheet) continue;
            $xpath = new \DOMXPath($sheet);
            $rows = [];
            foreach ($xpath->query('//*[local-name()="sheetData"]/*[local-name()="row"]') ?: [] as $row) {
                $cells = [];
                foreach ($xpath->query('./*[local-name()="c"]', $row) ?: [] as $cell) {
                    $ref = $cell->attributes?->getNamedItem('r')?->nodeValue ?? '';
                    preg_match('/^[A-Z]+/', $ref, $columnMatch);
                    $column = $this->columnNumber($columnMatch[0] ?? 'A');
                    $type = $cell->attributes?->getNamedItem('t')?->nodeValue;
                    $valueNode = $xpath->query('./*[local-name()="v"]', $cell)?->item(0);
                    $value = $valueNode?->textContent ?? '';
                    if ($type === 's') $value = $sharedStrings[(int) $value] ?? '';
                    if ($type === 'inlineStr') {
                        $value = '';
                        foreach ($xpath->query('.//*[local-name()="t"]', $cell) ?: [] as $node) $value .= $node->textContent;
                    }
                    $cells[$column] = $value;
                }
                if ($cells) {
                    $maxColumn = max(array_keys($cells));
                    $values = [];
                    for ($column = 1; $column <= $maxColumn; $column++) $values[] = '<td>'.e((string) ($cells[$column] ?? '')).'</td>';
                    $rows[] = '<tr>'.implode('', $values).'</tr>';
                }
            }
            if ($rows) $sheets[] = '<section><h2>'.e(basename($sheetPath, '.xml')).'</h2><table><tbody>'.implode('', $rows).'</tbody></table></section>';
        }
        $zip->close();

        return $sheets ? implode('', $sheets) : '<p class="empty">This spreadsheet contains no readable cells.</p>';
    }

    private function previewCsv(string $path): string
    {
        $handle = fopen($path, 'rb');
        if (! $handle) return '<p class="empty">This CSV file could not be previewed.</p>';
        $rows = [];
        while (($row = fgetcsv($handle)) !== false && count($rows) < 1000) {
            $cells = array_map(fn ($cell) => '<td>'.e((string) $cell).'</td>', $row);
            $rows[] = '<tr>'.implode('', $cells).'</tr>';
        }
        fclose($handle);

        return $rows ? '<table><tbody>'.implode('', $rows).'</tbody></table>' : '<p class="empty">This CSV file is empty.</p>';
    }

    private function openOfficeArchive(string $path): ?\ZipArchive
    {
        if (! class_exists(\ZipArchive::class)) return null;
        $zip = new \ZipArchive();

        return $zip->open($path) === true ? $zip : null;
    }

    private function loadOfficeXml(string|false|null $xml): ?\DOMDocument
    {
        if (! $xml || strlen($xml) > 15_000_000) return null;
        $document = new \DOMDocument();

        return $document->loadXML($xml, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING) ? $document : null;
    }

    private function columnNumber(string $letters): int
    {
        $number = 0;
        foreach (str_split($letters) as $letter) $number = $number * 26 + ord($letter) - 64;

        return $number;
    }

    public function updateAccess(Request $request, Document $document): RedirectResponse
    {
        Gate::authorize('manage', $document);
        $data = $request->validate(['access_level' => ['required', Rule::in(Document::ACCESS_LEVELS)]]);
        $previous = $document->access_level;
        $document->update($data);
        AuditLog::create(['actor_type' => $request->user()->getMorphClass(), 'actor_id' => $request->user()->id, 'action' => 'document.access_updated', 'subject_type' => Document::class, 'subject_id' => $document->id, 'organization_id' => $document->folder->organization_id, 'metadata' => ['from' => $previous, 'to' => $data['access_level'], 'name' => $document->name], 'ip_address' => $request->ip()]);

        return back()->with('success', 'Document access updated.');
    }

    public function destroy(Request $request, Document $document): RedirectResponse
    {
        Gate::authorize('manage', $document);
        $paths = $document->versions()->pluck('path');
        AuditLog::create(['actor_type' => $request->user()->getMorphClass(), 'actor_id' => $request->user()->id, 'action' => 'document.deleted', 'subject_type' => Document::class, 'subject_id' => $document->id, 'organization_id' => $document->folder->organization_id, 'metadata' => ['name' => $document->name, 'versions' => $document->current_version], 'ip_address' => $request->ip()]);
        $document->delete();
        Storage::disk('local')->delete($paths->all());

        return redirect()->route('documents.index')->with('success', 'Document deleted.');
    }
}
