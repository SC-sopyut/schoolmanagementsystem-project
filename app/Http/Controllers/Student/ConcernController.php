<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreConcernRequest;
use App\Models\Concern;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ConcernController extends Controller
{
    /** Step 1-3 wizard page. Only orgs the student belongs to can be chosen. */
    public function create(): Response
    {
        return Inertia::render('student/concerns/create', [
            'organizations' => request()->user()->organizations()->get(['organizations.id', 'organizations.name']),
        ]);
    }

    /** "My Submitted Concerns" - always the student's own, with real identity and full timeline. */
    public function index(): Response
    {
        $concerns = Concern::query()
            ->where('student_id', request()->user()->id)
            ->with(['organization:id,name', 'updatesTimeline.officer.user:id,name'])
            ->latest()->get()
            ->map(fn (Concern $c) => [
                'id' => $c->id, 'tracking_code' => $c->tracking_code, 'subject' => $c->subject,
                'body' => $c->body, 'category' => $c->category, 'priority' => $c->priority,
                'status' => $c->status, 'is_anonymous' => $c->is_anonymous,
                'organization' => $c->organization?->name, 'updated_at' => $c->updated_at,
                'created_at' => $c->created_at,
                'timeline' => $c->updatesTimeline->map(fn ($u) => [
                    'id' => $u->id, 'stage_label' => $u->stage_label, 'message' => $u->message,
                    'created_at' => $u->created_at,
                    'officer' => $u->officer ? [
                        'name' => $u->officer->user?->name, 'position' => $u->officer->position,
                    ] : null,
                ]),
            ]);

        return Inertia::render('student/concerns/index', ['concerns' => $concerns]);
    }

    public function store(StoreConcernRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $this->authorize('create', [Concern::class, (int) $data['organization_id']]);

        $concern = Concern::create([
            'student_id' => $request->user()->id, // always stored, even when anonymous
            'organization_id' => $data['organization_id'],
            'subject' => $data['subject'],
            'category' => $data['category'],
            'priority' => $data['priority'],
            'body' => $data['body'],
            'is_anonymous' => $request->boolean('is_anonymous'),
            'status' => 'submitted',
        ]);

        // The wizard's step 3 reads this flash to show the tracking number.
        return redirect()->route('student.concerns.create')->with('tracking_code', $concern->tracking_code);
    }
}
