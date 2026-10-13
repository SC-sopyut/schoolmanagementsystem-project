<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationJoinRequest;
use App\Support\OfficerScope;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationMembershipController extends Controller
{
    public function index(Request $request): Response
    {
        $user = OfficerScope::user($request->user());
        $user->load('organizations:id,name', 'organizationJoinRequests.organization:id,name');

        return Inertia::render('student/organizations/index', [
            'memberships' => $user->organizations->map(fn (Organization $organization) => ['id' => $organization->id, 'name' => $organization->name]),
            'organizations' => Organization::query()->orderBy('name')->get(['id', 'name']),
            'requests' => $user->organizationJoinRequests->map(fn (OrganizationJoinRequest $joinRequest) => [
                'organization_id' => $joinRequest->organization_id,
                'organization' => $joinRequest->organization?->name,
                'status' => $joinRequest->status,
                'created_at' => $joinRequest->created_at,
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = OfficerScope::user($request->user());
        $data = $request->validate(['organization_id' => ['required', 'integer', Rule::exists('organizations', 'id')]]);
        $organizationId = (int) $data['organization_id'];

        if ($user->organizations()->whereKey($organizationId)->exists()) {
            return back()->withErrors(['organization_id' => 'You are already a member of this organization.']);
        }

        OrganizationJoinRequest::query()->updateOrCreate(
            ['user_id' => $user->id, 'organization_id' => $organizationId],
            ['status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null],
        );

        return back()->with('success', 'Membership request sent to the organization president.');
    }
}
