<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\OrganizationJoinRequest;
use App\Support\OfficerScope;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OrganizationJoinRequestController extends Controller
{
    public function approve(Request $request, OrganizationJoinRequest $joinRequest): RedirectResponse
    {
        $officer = OfficerScope::profile($request->user());
        abort_unless(strcasecmp(trim((string) $officer->position), 'president') === 0 && $officer->organization_id === $joinRequest->organization_id, 403);
        abort_unless($joinRequest->status === 'pending', 404);

        $joinRequest->user->organizations()->syncWithoutDetaching([$joinRequest->organization_id]);
        $joinRequest->update(['status' => 'approved', 'reviewed_by' => $officer->user_id, 'reviewed_at' => now()]);
        AuditLog::create(['actor_type' => $officer->user->getMorphClass(), 'actor_id' => $officer->user_id, 'action' => 'membership.request_approved', 'subject_type' => $joinRequest->user->getMorphClass(), 'subject_id' => $joinRequest->user_id, 'organization_id' => $joinRequest->organization_id, 'metadata' => ['member' => $joinRequest->user->name], 'ip_address' => $request->ip()]);

        return back()->with('success', 'Membership request approved.');
    }

    public function reject(Request $request, OrganizationJoinRequest $joinRequest): RedirectResponse
    {
        $officer = OfficerScope::profile($request->user());
        abort_unless(strcasecmp(trim((string) $officer->position), 'president') === 0 && $officer->organization_id === $joinRequest->organization_id, 403);
        abort_unless($joinRequest->status === 'pending', 404);
        $joinRequest->update(['status' => 'rejected', 'reviewed_by' => $officer->user_id, 'reviewed_at' => now()]);

        return back()->with('success', 'Membership request declined.');
    }
}
