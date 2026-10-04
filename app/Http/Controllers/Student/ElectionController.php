<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreVoteRequest;
use App\Models\Election;
use App\Models\Vote;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ElectionController extends Controller
{
    /**
     * List elections visible to the logged-in student: council-wide elections,
     * plus elections belonging to any organization they're a member of.
     * Each row also tells the frontend which positions this student has already
     * voted for, so the UI can grey those out without a second round trip.
     */
    public function index(): Response
    {
        $user = request()->user();
        $orgIds = $user->organizations()->pluck('organizations.id');

        $elections = Election::query()
            ->where(fn ($q) => $q->whereNull('organization_id')->orWhereIn('organization_id', $orgIds))
            ->whereIn('status', ['open', 'closed'])
            ->with(['organization:id,name', 'candidates.user:id,name'])
            ->latest('starts_at')
            ->get()
            ->map(function (Election $election) use ($user) {
                $election->voted_positions = $election->votes()
                    ->where('user_id', $user->id)
                    ->pluck('position');

                return $election;
            });

        return Inertia::render('student/elections/index', [
            'elections' => $elections,
        ]);
    }

    public function show(Election $election): Response
    {
        $this->authorizeViewable($election);

        $election->load(['organization:id,name', 'candidates.user:id,name']);
        $election->voted_positions = $election->votes()
            ->where('user_id', request()->user()->id)
            ->pluck('position');

        return Inertia::render('student/elections/show', [
            'election' => $election,
        ]);
    }

    /**
     * Cast a ballot.
     *
     * Security-critical path:
     *  - StoreVoteRequest already confirmed candidate_id belongs to THIS election.
     *  - Gate::authorize('vote', ...) re-checks the voting window, org membership,
     *    and "not already voted" — all server-side, never trusting the client's
     *    disabled-button state.
     *  - The insert relies on the DB unique(election_id,user_id,position) constraint
     *    as the final backstop against a race condition (e.g. two rapid double-clicks
     *    landing in two concurrent requests): if both pass the policy check at the
     *    same instant, only one INSERT can succeed and the second throws, which we
     *    convert into a friendly validation error instead of a 500.
     */
    public function store(StoreVoteRequest $request, Election $election): RedirectResponse
    {
        $user = $request->user();
        $position = $request->string('position')->toString();

        $this->authorize('vote', [$election, $position]);

        try {
            DB::transaction(function () use ($request, $election, $user, $position) {
                Vote::create([
                    'election_id' => $election->id,
                    'candidate_id' => $request->integer('candidate_id'),
                    'user_id' => $user->id,
                    'position' => $position,
                    'voted_at' => now(),
                ]);
            });
        } catch (QueryException $e) {
            return back()->withErrors(['candidate_id' => 'You have already voted for this position.']);
        }

        return back()->with('success', 'Your vote has been recorded.');
    }

    private function authorizeViewable(Election $election): void
    {
        $user = request()->user();
        $isMember = $election->isCouncilWide()
            || $user->organizations()->where('organizations.id', $election->organization_id)->exists();

        abort_unless($isMember, 403);
    }
}
