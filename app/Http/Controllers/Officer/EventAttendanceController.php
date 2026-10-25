<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAttendanceSession;
use App\Models\EventAttendee;
use App\Models\User;
use App\Services\StudentScanResolver;
use App\Support\OfficerScope;
use App\Support\ExpiryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EventAttendanceController extends Controller
{
    public function index(Request $request, Event $event, StudentScanResolver $resolver): Response|RedirectResponse
    {
        $this->authorize('managePlanning', $event);
        ExpiryService::sync();
        $event->refresh();
        if ($event->status === 'expired' || $event->ends_at?->isPast()) {
            return redirect()
                ->route('officer.events.index')
                ->with('error', 'Attendance is unavailable because this event has expired. Change the event dates first if it needs to be rescheduled.');
        }
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

    public function recordAttendance(Request $request, Event $event): RedirectResponse
    {
        $this->authorize('managePlanning', $event);
        ExpiryService::sync();
        $event->refresh();
        if ($event->status === 'expired' || $event->ends_at?->isPast()) {
            return back()->withErrors(['attendance' => 'Attendance cannot be recorded for an expired event.']);
        }
        $data = $request->validate(['user_id' => ['required', 'integer', 'exists:users,id']]);
        $student = User::findOrFail($data['user_id']);
        if ($student->studentProfile && $student->studentProfile->status !== 'approved') {
            return back()->withErrors(['user_id' => 'This student account is still pending verification.']);
        }
        $officer = OfficerScope::user($request->user());

        $message = DB::transaction(function () use ($data, $event, $officer): string {
            $attendee = EventAttendee::firstOrCreate(
                ['event_id' => $event->id, 'user_id' => $data['user_id']],
                ['joined_at' => now()],
            );

            $attendee = EventAttendee::query()->lockForUpdate()->findOrFail($attendee->id);
            $openSession = $attendee->attendanceSessions()
                ->whereNull('checked_out_at')
                ->latest('checked_in_at')
                ->first();

            if ($openSession) {
                $openSession->update([
                    'checked_out_at' => now(),
                    'checked_out_by' => $officer->id,
                ]);

                return 'Student checked out.';
            }

            $attendee->attendanceSessions()->create([
                'checked_in_at' => now(),
                'checked_in_by' => $officer->id,
            ]);

            return 'Student checked in.';
        });

        return back()->with('success', $message);
    }

    /** @return array{id:int,name:string,avatar:?string,student_id_no:?string,course:?string,year_level:?int,attendance_sessions:list<array{id:int,checked_in_at:string,checked_out_at:?string}>} */
    private function studentData(User $student, Event $event): array
    {
        $attendance = EventAttendee::query()
            ->with(['attendanceSessions' => fn ($query) => $query->latest('checked_in_at')])
            ->where('event_id', $event->id)->where('user_id', $student->id)->first();

        return [
            'id' => $student->id,
            'name' => $student->name,
            'avatar' => $student->avatar,
            'student_id_no' => $student->studentProfile?->student_id_no,
            'course' => $student->studentProfile?->course,
            'year_level' => $student->studentProfile?->year_level,
            'attendance_sessions' => $attendance?->attendanceSessions
                ->map(fn (EventAttendanceSession $session): array => [
                    'id' => $session->id,
                    'checked_in_at' => $session->checked_in_at->toIso8601String(),
                    'checked_out_at' => $session->checked_out_at?->toIso8601String(),
                ])
                ->values()
                ->all() ?? [],
        ];
    }
}
