<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationMembershipController extends Controller
{
    public function index(): Response
    {
        $students = User::query()
            ->whereDoesntHave('officerProfile')
            ->whereDoesntHave('organizations')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $officers = User::query()->whereHas('officerProfile')
            ->with(['officerProfile.organization:id,name', 'organizations:id,name'])
            ->orderBy('name')->get(['id', 'name', 'email'])->map(function (User $officer): array {
                $primary = $officer->officerProfile?->organization;
                $organizations = $officer->organizations->map(fn (Organization $organization) => [
                    'id' => $organization->id,
                    'name' => $organization->name,
                    'is_primary' => $organization->id === $officer->officerProfile?->organization_id,
                ]);
                if ($primary && ! $organizations->contains('id', $primary->id)) {
                    $organizations->push(['id' => $primary->id, 'name' => $primary->name, 'is_primary' => true]);
                }

                return [
                    'id' => $officer->id,
                    'name' => $officer->name,
                    'email' => $officer->email,
                    'organizations' => $organizations->sortByDesc('is_primary')->values(),
                ];
            });

        return Inertia::render('admin/memberships/index', [
            'students' => $students,
            'officers' => $officers,
            'organizations' => Organization::query()->orderBy('name')->get(['id', 'name']),
            'memberships' => User::query()
                ->whereDoesntHave('officerProfile')
                ->whereHas('organizations')
                ->with(['organizations:id,name'])
                ->orderBy('name')
                ->get(['id', 'name', 'email'])
                ->map(fn (User $student) => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'organizations' => $student->organizations->map(fn (Organization $organization) => ['id' => $organization->id, 'name' => $organization->name])->values(),
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'account_type' => ['required', 'in:student,officer'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'organization_id' => ['required', 'integer', 'exists:organizations,id'],
        ]);

        $account = User::query()->findOrFail((int) $validated['user_id']);
        if ($validated['account_type'] === 'officer') {
            abort_unless($account->officerProfile()->exists(), 422, 'Choose an officer account.');
        } else {
            abort_if($account->officerProfile()->exists(), 422, 'Officer accounts must be added as officers.');
            $alreadyInAnotherOrganization = $account->organizations()
                ->where('organizations.id', '!=', $validated['organization_id'])->exists();
            if ($alreadyInAnotherOrganization) {
                return back()->withErrors(['user_id' => 'Students can belong to one organization only. Remove the existing membership first.']);
            }
        }

        $alreadyMember = $account->organizations()
            ->where('organizations.id', $validated['organization_id'])
            ->exists();

        $account->organizations()->syncWithoutDetaching([$validated['organization_id']]);
        AuditLog::create(['actor_type' => $request->user('admin')->getMorphClass(), 'actor_id' => $request->user('admin')->id, 'action' => $validated['account_type'] === 'officer' ? 'officer.organization_added' : 'membership.added', 'subject_type' => User::class, 'subject_id' => $account->id, 'organization_id' => $validated['organization_id'], 'metadata' => ['user' => $account->name], 'ip_address' => $request->ip()]);

        return back()->with('success', $alreadyMember
            ? 'That account is already linked to this organization.'
            : ($validated['account_type'] === 'officer' ? 'Officer added to the organization.' : 'Student added to the organization.'));
    }

    public function destroy(Request $request, User $user, Organization $organization): RedirectResponse
    {
        abort_if($user->officerProfile()->exists(), 422, 'Officer organization affiliations cannot be removed here.');
        abort_unless($user->organizations()->whereKey($organization->id)->exists(), 404);

        $user->organizations()->detach($organization->id);
        AuditLog::create(['actor_type' => $request->user('admin')->getMorphClass(), 'actor_id' => $request->user('admin')->id, 'action' => 'membership.removed', 'subject_type' => User::class, 'subject_id' => $user->id, 'organization_id' => $organization->id, 'metadata' => ['user' => $user->name], 'ip_address' => $request->ip()]);

        return back()->with('success', 'Student removed from the organization.');
    }

    public function destroyOfficerAffiliation(Request $request, User $user, Organization $organization): RedirectResponse
    {
        $officer = $user->officerProfile;
        abort_unless($officer, 404);
        abort_if($officer->organization_id === $organization->id, 422, 'The officer’s primary organization cannot be removed here.');
        abort_unless($user->organizations()->whereKey($organization->id)->exists(), 404);

        $user->organizations()->detach($organization->id);
        AuditLog::create(['actor_type' => $request->user('admin')->getMorphClass(), 'actor_id' => $request->user('admin')->id, 'action' => 'officer.organization_removed', 'subject_type' => User::class, 'subject_id' => $user->id, 'organization_id' => $organization->id, 'metadata' => ['user' => $user->name], 'ip_address' => $request->ip()]);

        return back()->with('success', 'Officer affiliation removed.');
    }
}
