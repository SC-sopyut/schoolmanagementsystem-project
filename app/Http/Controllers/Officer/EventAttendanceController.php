<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAttendee;
use App\Models\User;
use App\Services\StudentScanResolver;
use App\Support\OfficerScope;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventAttendanceController extends Controller
{
    public function index(Request $request, Event $event, StudentScanResolver $resolver): Response
    {
        $this->authorize('managePlanning', $event);
        $scan = trim((string) $request->query('scan', ''));
        $search = trim((string) $request->query('search', ''));
        $student = $scan !== '' ? $resolver->resolveStudentFromScan($scan) : null;

        return Inertia::render('officer/events/attendance', [
            'event' => ['id' => $event->id, 'title' => $event->title],
            'student' => $student ? $this->studentData($student, $event) : null,
            'matches' => $search === '' ? [] : User::query()
                ->where('name', 'like', "%{$search}%")
                ->where(function ($query): void {
                    $query->whereDoesntHave('studentProfile')
                        ->orWhereHas('studentProfile', fn ($profile) => $profile->where('status', 'approved'));
                })
                ->with('studentProfile')
                ->orderBy('name')->limit(8)->get()
                ->map(fn (User $user) => $this->studentData($user, $event)),
            'scanNotFound' => $scan !== '' && $student === null,
        ]);
    }

    public function checkIn(Request $request, Event $event): RedirectResponse
    {
        $this->authorize('managePlanning', $event);
        $data = $request->validate(['user_id' => ['required', 'integer', 'exists:users,id']]);
        $student = User::findOrFail($data['user_id']);
        if ($student->studentProfile && $student->studentProfile->status !== 'approved') {
            return back()->withErrors(['user_id' => 'This student account is still pending verification.']);
        }
        $officer = OfficerScope::user($request->user());

        $attendee = EventAttendee::firstOrCreate(
            ['event_id' => $event->id, 'user_id' => $data['user_id']],
            ['joined_at' => now()],
        );

        if ($attendee->checked_in_at) {
            return back()->with('error', "This student was already checked in at {$attendee->checked_in_at->format('g:i A') }.");
        }

        $attendee->update(['checked_in_at' => now(), 'checked_in_by' => $officer->id]);

        return back()->with('success', 'Student checked in.');
    }

    /** @return array{id:int,name:string,avatar:?string,student_id_no:?string,course:?string,year_level:?int,checked_in_at:?string} */
    private function studentData(User $student, Event $event): array
    {
        $attendance = EventAttendee::query()
            ->where('event_id', $event->id)->where('user_id', $student->id)->first();

        return [
            'id' => $student->id,
            'name' => $student->name,
            'avatar' => $student->avatar,
            'student_id_no' => $student->studentProfile?->student_id_no,
            'course' => $student->studentProfile?->course,
            'year_level' => $student->studentProfile?->year_level,
            'checked_in_at' => $attendance?->checked_in_at?->toIso8601String(),
        ];
    }
}
