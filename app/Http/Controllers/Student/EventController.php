<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAttendee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();
        $orgIds = $user->organizations()->pluck('organizations.id');

        $events = Event::query()
            ->where(fn ($q) => $q->whereNull('organization_id')->orWhereIn('organization_id', $orgIds))
            ->where('starts_at', '>=', now())
            ->whereIn('status', ['planned', 'ongoing'])
            ->withCount('attendees')
            ->withExists(['attendees as is_joined' => fn ($q) => $q->where('user_id', $user->id)])
            ->with('organization:id,name')
            ->orderBy('starts_at')
            ->get();

        return Inertia::render('student/events/index', [
            'events' => $events,
        ]);
    }

    /**
     * Join (RSVP to) an event.
     *
     * EventPolicy::join enforces: council-wide events are open to everyone; a
     * sub-org's own event requires membership in that org. The unique DB
     * constraint on (event_id, user_id) means a double-submit just no-ops via
     * firstOrCreate rather than producing duplicate attendance rows or a 500.
     */
    public function join(Event $event): RedirectResponse
    {
        $this->authorize('join', $event);

        DB::transaction(function () use ($event) {
            EventAttendee::firstOrCreate(
                ['event_id' => $event->id, 'user_id' => request()->user()->id],
                ['joined_at' => now()]
            );
        });

        return back()->with('success', 'You are on the attendee list for this event.');
    }
}
