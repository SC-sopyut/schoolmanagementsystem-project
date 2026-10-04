<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Concern;
use App\Models\Document;
use App\Models\Event;
use App\Models\EventAttendee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** NOTE: not in the Figma - a minimal student home built from the same stat-card pattern. */
class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $orgIds = $user->organizations()->pluck('organizations.id');

        $events = Event::query()
            ->where(fn ($q) => $q->whereNull('organization_id')->orWhereIn('organization_id', $orgIds))
            ->where('starts_at', '>=', now())->whereIn('status', ['planned', 'ongoing'])
            ->orderBy('starts_at');

        return Inertia::render('student/dashboard', [
            'first_name' => strtok($user->name, ' '),
            'stats' => [
                'open_concerns' => Concern::where('student_id', $user->id)->where('status', '!=', 'resolved')->count(),
                'resolved_concerns' => Concern::where('student_id', $user->id)->where('status', 'resolved')->count(),
                'upcoming_events' => (clone $events)->count(),
                'events_joined' => EventAttendee::where('user_id', $user->id)->count(),
            ],
            'events' => (clone $events)->limit(3)->get(['id', 'title', 'starts_at', 'location']),
            'concerns' => Concern::where('student_id', $user->id)->latest()->limit(3)
                ->get(['id', 'tracking_code', 'subject', 'status']),
            'deleted_uploads' => AuditLog::query()
                ->where('action', 'document.deleted')
                ->where('subject_type', Document::class)
                ->whereIn('organization_id', $orgIds)
                ->with(['actor', 'organization:id,name'])
                ->recent()->limit(5)->get()
                ->map(fn (AuditLog $log) => [
                    'id' => $log->id,
                    'name' => $log->metadata['name'] ?? 'Deleted document',
                    'versions' => (int) ($log->metadata['versions'] ?? 1),
                    'actor' => $log->actor?->name ?? 'Unknown user',
                    'organization' => $log->organization?->name,
                    'deleted_at' => $log->created_at,
                ]),
        ]);
    }
}
