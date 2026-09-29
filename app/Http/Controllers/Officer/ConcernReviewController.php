<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Officer\ForwardConcernRequest;
use App\Models\Concern;
use App\Models\FeedItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConcernReviewController extends Controller
{
    /** Inbox. Every row goes through toOfficerArray() - anonymous identities never reach the page. */
    public function index(Request $request): Response
    {
        $officer = $request->user()->officerProfile;

        return Inertia::render('officer/concerns/index', [
            'concerns' => Concern::query()
                ->whereIn('organization_id', $officer->visibleOrganizationIds())
                ->with(['organization:id,name', 'student:id,name', 'updatesTimeline'])
                ->latest()->get()->map->toOfficerArray(),
        ]);
    }

    public function review(Concern $concern): RedirectResponse
    {
        $this->authorize('review', $concern);
        abort_unless($concern->status === 'submitted', 422, 'Already reviewed.');
        $officer = request()->user()->officerProfile;

        $concern->update(['status' => 'reviewed', 'reviewed_by' => $officer->id]);
        $concern->updatesTimeline()->create(['officer_id' => $officer->id, 'stage_label' => 'Officer Assigned']);

        return back();
    }

    public function forward(ForwardConcernRequest $request, Concern $concern): RedirectResponse
    {
        $this->authorize('forward', $concern);
        $officer = $request->user()->officerProfile;

        $concern->update([
            'status' => 'forwarded',
            'officer_notes' => $request->string('officer_notes'),
            'forwarded_at' => now(),
        ]);
        $concern->updatesTimeline()->create([
            'officer_id' => $officer->id,
            'stage_label' => 'Forwarded to the Board',
            'message' => $request->string('officer_notes'),
        ]);

        return back()->with('success', 'Concern forwarded to the board.');
    }

    /** Officer-authored timeline entry + optional reply - what the student sees on My Concerns. */
    public function addUpdate(Request $request, Concern $concern): RedirectResponse
    {
        $this->authorize('review', $concern);
        $data = $request->validate([
            'stage_label' => ['required', 'string', 'max:80'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        $concern->updatesTimeline()->create($data + ['officer_id' => $request->user()->officerProfile->id]);

        return back();
    }

    public function resolve(Concern $concern): RedirectResponse
    {
        $this->authorize('review', $concern);
        abort_unless($concern->status === 'forwarded', 422, 'Forward the concern before resolving it.');

        $concern->update(['status' => 'resolved', 'resolved_at' => now()]);
        $concern->updatesTimeline()->create([
            'officer_id' => request()->user()->officerProfile->id,
            'stage_label' => 'Resolved',
        ]);
        FeedItem::record(request()->user(), $concern->organization_id, "resolved concern {$concern->tracking_code}");

        return back();
    }
}
