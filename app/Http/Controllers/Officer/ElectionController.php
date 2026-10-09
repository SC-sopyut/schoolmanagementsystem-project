<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Election;
use App\Models\User;
use App\Support\OfficerScope;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ElectionController extends Controller
{
    public function index(Request $request): Response
    {
        $officer = OfficerScope::profile($request->user());
        $ids = $officer->visibleOrganizationIds();
        return Inertia::render('officer/voting/index', [
            'elections' => Election::where(fn ($q) => $q->whereIn('organization_id', $ids)->orWhereNull('organization_id'))
                ->with('organization:id,name')->withCount(['candidates', 'votes'])->latest('starts_at')->get()
                ->map(fn (Election $e) => ['id' => $e->id, 'title' => $e->title, 'status' => $e->status, 'organization' => $e->organization->name ?? 'School-wide', 'starts_at' => $e->starts_at, 'ends_at' => $e->ends_at, 'candidates_count' => $e->candidates_count, 'votes_count' => $e->votes_count]),
            'organizations' => \App\Models\Organization::whereIn('id', $ids)->get(['id', 'name']),
            'can_create_school_wide' => (bool) $officer->organization?->is_council,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['organization_id' => ['nullable', 'exists:organizations,id'], 'title' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string'], 'positions' => ['required', 'array', 'min:1'], 'positions.*' => ['required', 'string', 'max:100', 'distinct'], 'starts_at' => ['required', 'date'], 'ends_at' => ['required', 'date', 'after:starts_at']]);
        $this->authorize('create', [Election::class, $data['organization_id'] ?? null]);
        $election = Election::create([...$data, 'created_by' => $request->user()->id, 'status' => 'draft']);
        $this->audit($request, $election, 'election.created');
        return back()->with('success', 'Election created as a draft.');
    }

    public function open(Request $request, Election $election): RedirectResponse
    {
        $this->authorize('manage', $election);
        abort_if($election->status !== 'draft', 422, 'Only drafts can be opened.');
        abort_if($election->candidates()->count() === 0, 422, 'Add at least one candidate before opening.');
        $election->update(['status' => 'open']); $this->audit($request, $election, 'election.opened');
        return back()->with('success', 'Election is open.');
    }

    public function close(Request $request, Election $election): RedirectResponse
    {
        $this->authorize('manage', $election);
        abort_if($election->status !== 'open', 422, 'Only open elections can be closed.');
        $election->update(['status' => 'closed']); $this->audit($request, $election, 'election.closed');
        return back()->with('success', 'Election closed.');
    }

    public function publish(Request $request, Election $election): RedirectResponse
    {
        $this->authorize('manage', $election);
        abort_if($election->status !== 'closed', 422, 'Close the election before publishing results.');
        $election->update(['results_published_at' => now()]); $this->audit($request, $election, 'election.results_published');
        return back()->with('success', 'Results published.');
    }

    private function audit(Request $request, Election $election, string $action): void
    {
        AuditLog::create(['actor_type' => $request->user()->getMorphClass(), 'actor_id' => $request->user()->id, 'action' => $action, 'subject_type' => Election::class, 'subject_id' => $election->id, 'organization_id' => $election->organization_id, 'metadata' => ['title' => $election->title], 'ip_address' => $request->ip()]);
    }
}
