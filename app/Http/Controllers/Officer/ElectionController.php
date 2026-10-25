<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\Organization;
use App\Models\User;
use App\Support\OfficerScope;
use App\Support\ExpiryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ElectionController extends Controller
{
    public function index(Request $request): Response
    {
        ExpiryService::sync();
        $officer = OfficerScope::profile($request->user());
        $ids = $officer->visibleOrganizationIds();

        return Inertia::render('officer/voting/index', [
            'elections' => Election::where(fn ($q) => $q->whereIn('organization_id', $ids)->orWhereNull('organization_id'))
                ->with(['organization:id,name', 'candidates.user:id,name'])
                ->withCount(['candidates', 'votes'])->latest('starts_at')->get()
                ->map(fn (Election $e) => [
                    'id' => $e->id,
                    'title' => $e->title,
                    'description' => $e->description,
                    'status' => $e->status,
                    'organization' => $e->organization->name ?? 'School-wide',
                    'starts_at' => $e->starts_at,
                    'ends_at' => $e->ends_at,
                    'positions' => $e->positions,
                    'candidates_count' => $e->candidates_count,
                    'votes_count' => $e->votes_count,
                    'candidates' => $e->candidates->map(fn (Candidate $candidate) => [
                        'id' => $candidate->id,
                        'name' => $candidate->user->name,
                        'position' => $candidate->position,
                        'party_name' => $candidate->party_name,
                        'platform' => $candidate->platform,
                    ]),
                    'eligible_candidates' => $this->eligibleCandidates($e)->get(['id', 'name'])
                        ->map(fn (User $user) => ['id' => $user->id, 'name' => $user->name]),
                ]),
            'organizations' => Organization::whereIn('id', $ids)->get(['id', 'name']),
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
        if ($election->status !== 'draft') {
            throw ValidationException::withMessages(['election' => 'Only drafts can be opened.']);
        }
        if (! $election->candidates()->exists()) {
            throw ValidationException::withMessages(['candidates' => 'Add at least one candidate before opening.']);
        }
        $election->update(['status' => 'open']);
        $this->audit($request, $election, 'election.opened');

        return back()->with('success', 'Election is open.');
    }

    public function update(Request $request, Election $election): RedirectResponse
    {
        $this->authorize('manage', $election);
        if ($election->status !== 'draft') {
            throw ValidationException::withMessages(['election' => 'Only draft elections can be edited.']);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'positions' => ['required', 'array', 'min:1'],
            'positions.*' => ['required', 'string', 'max:100', 'distinct'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
        ]);

        if ($election->candidates()->exists() && $data['positions'] !== $election->positions) {
            throw ValidationException::withMessages(['positions' => 'Positions cannot change after candidates have been added.']);
        }

        $election->update($data);
        $this->audit($request, $election, 'election.updated');

        return back()->with('success', 'Draft election updated.');
    }

    public function storeCandidate(Request $request, Election $election): RedirectResponse
    {
        $this->authorize('manage', $election);

        if ($election->status !== 'draft') {
            throw ValidationException::withMessages(['candidate' => 'Candidates can only be added while the election is a draft.']);
        }

        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'position' => ['required', 'string', Rule::in($election->positions ?? [])],
            'party_name' => ['nullable', 'string', 'max:100'],
            'platform' => ['nullable', 'string', 'max:2000'],
        ]);

        if (! $this->eligibleCandidates($election)->whereKey($data['user_id'])->exists()) {
            throw ValidationException::withMessages(['user_id' => 'This person is not eligible for this election.']);
        }

        $candidate = Candidate::firstOrCreate(
            ['election_id' => $election->id, 'user_id' => $data['user_id'], 'position' => $data['position']],
            [
                'party_name' => filled($data['party_name'] ?? null) ? $data['party_name'] : null,
                'platform' => $data['platform'] ?? null,
            ],
        );

        if (! $candidate->wasRecentlyCreated) {
            throw ValidationException::withMessages(['candidate' => 'This person is already a candidate for that position.']);
        }

        $this->audit($request, $election, 'election.candidate_added');

        return back()->with('success', 'Candidate added to the election.');
    }

    public function close(Request $request, Election $election): RedirectResponse
    {
        $this->authorize('manage', $election);
        abort_if($election->status !== 'open', 422, 'Only open elections can be closed.');
        $election->update(['status' => 'closed']);
        $this->audit($request, $election, 'election.closed');

        return back()->with('success', 'Election closed.');
    }

    public function reschedule(Request $request, Election $election): RedirectResponse
    {
        $this->authorize('manage', $election);
        $data = $request->validate([
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'reason' => ['required', 'string', 'max:500'],
        ]);
        $before = ['starts_at' => $election->starts_at, 'ends_at' => $election->ends_at];
        $nextStatus = $election->status === 'expired'
            ? ($election->candidates()->exists() ? 'open' : 'draft')
            : $election->status;
        $election->update([
            'starts_at' => $data['starts_at'],
            'ends_at' => $data['ends_at'],
            'status' => $nextStatus,
        ]);
        AuditLog::create(['actor_type' => $request->user()->getMorphClass(), 'actor_id' => $request->user()->id, 'action' => 'election.rescheduled', 'subject_type' => Election::class, 'subject_id' => $election->id, 'organization_id' => $election->organization_id, 'metadata' => ['title' => $election->title, 'before' => $before, 'after' => ['starts_at' => $data['starts_at'], 'ends_at' => $data['ends_at']], 'reason' => $data['reason']], 'ip_address' => $request->ip()]);

        return back()->with('success', 'Election dates updated and the reason was logged.');
    }

    public function publish(Request $request, Election $election): RedirectResponse
    {
        $this->authorize('manage', $election);
        abort_if($election->status !== 'closed', 422, 'Close the election before publishing results.');
        $election->update(['results_published_at' => now()]);
        $this->audit($request, $election, 'election.results_published');

        return back()->with('success', 'Results published.');
    }

    private function audit(Request $request, Election $election, string $action): void
    {
        AuditLog::create(['actor_type' => $request->user()->getMorphClass(), 'actor_id' => $request->user()->id, 'action' => $action, 'subject_type' => Election::class, 'subject_id' => $election->id, 'organization_id' => $election->organization_id, 'metadata' => ['title' => $election->title], 'ip_address' => $request->ip()]);
    }

    /** @return \Illuminate\Database\Eloquent\Builder<User> */
    private function eligibleCandidates(Election $election)
    {
        if ($election->isCouncilWide()) {
            return User::query()->orderBy('name');
        }

        return User::query()
            ->where(fn ($query) => $query
                ->whereHas('organizations', fn ($organizations) => $organizations->whereKey($election->organization_id))
                ->orWhereHas('officerProfile', fn ($officer) => $officer->where('organization_id', $election->organization_id)))
            ->orderBy('name');
    }
}
