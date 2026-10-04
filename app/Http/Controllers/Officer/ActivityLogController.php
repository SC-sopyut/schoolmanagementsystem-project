<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Officer\StoreActivityLogRequest;
use App\Models\ActivityLog;
use App\Models\AuditLog;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /** An officer's own accreditation log, scoped to their own organization only. */
    public function index(): Response
    {
        $officer = request()->user()->officerProfile;

        $logs = ActivityLog::query()
            ->where('officer_id', $officer->id)
            ->latest('activity_date')
            ->get();

        return Inertia::render('officer/activity-logs/index', [
            'logs' => $logs,
            'categories' => ActivityLog::CATEGORIES,
        ]);
    }

    /**
     * Record an activity for accreditation reporting. officer_id and organization_id
     * are derived from the authenticated officer's own profile, never taken from the
     * request body - an officer can only ever log activity under their own name and org.
     */
    public function store(StoreActivityLogRequest $request): RedirectResponse
    {
        $officer = $request->user()->officerProfile;

        $activity = ActivityLog::create([
            ...$request->validated(),
            'officer_id' => $officer->id,
            'organization_id' => $officer->organization_id,
        ]);
        AuditLog::create(['actor_type' => $request->user()->getMorphClass(), 'actor_id' => $request->user()->id, 'action' => 'activity_log.created', 'subject_type' => ActivityLog::class, 'subject_id' => $activity->id, 'organization_id' => $officer->organization_id, 'metadata' => ['title' => $activity->title, 'category' => $activity->category], 'ip_address' => $request->ip()]);

        return back()->with('success', 'Activity logged.');
    }
}
