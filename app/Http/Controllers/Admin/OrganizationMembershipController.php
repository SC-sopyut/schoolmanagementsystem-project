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
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('admin/memberships/index', [
            'students' => $students,
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
                    'organizations' => $student->organizations->pluck('name')->values(),
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'organization_id' => ['required', 'integer', 'exists:organizations,id'],
        ]);

        $student = User::query()
            ->whereDoesntHave('officerProfile')
            ->findOrFail($validated['user_id']);

        $alreadyMember = $student->organizations()
            ->where('organizations.id', $validated['organization_id'])
            ->exists();

        $student->organizations()->syncWithoutDetaching([$validated['organization_id']]);
        AuditLog::create(['actor_type' => $request->user('admin')->getMorphClass(), 'actor_id' => $request->user('admin')->id, 'action' => 'membership.added', 'subject_type' => User::class, 'subject_id' => $student->id, 'organization_id' => $validated['organization_id'], 'metadata' => ['user' => $student->name], 'ip_address' => $request->ip()]);

        return back()->with('success', $alreadyMember
            ? 'That student is already a member of this organization.'
            : 'Student added to the organization.');
    }
}
