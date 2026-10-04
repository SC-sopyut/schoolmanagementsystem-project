<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Committee;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MembersController extends Controller
{
    public function index(Request $request): Response
    {
        $officer = $request->user()->officerProfile;
        abort_unless($officer, 403);
        $organizationIds = $officer->visibleOrganizationIds();
        $organizations = Organization::query()->whereIn('id', $organizationIds)->orderBy('name')->get(['id', 'name']);

        $users = User::query()
            ->where(fn ($query) => $query
                ->whereHas('organizations', fn ($orgs) => $orgs->whereIn('organizations.id', $organizationIds))
                ->orWhereHas('officerProfile', fn ($profile) => $profile->whereIn('organization_id', $organizationIds)))
            ->with([
                'organizations' => fn ($query) => $query->whereIn('organizations.id', $organizationIds),
                'officerProfile.organization',
                'assignedTasks' => fn ($query) => $query
                    ->whereHas('committee', fn ($committee) => $committee->whereIn('organization_id', $organizationIds))
                    ->with('committee:id,name,organization_id'),
            ])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'created_at']);

        $members = $users->map(function (User $user) use ($organizationIds): array {
            $orgs = $user->organizations->map(fn ($organization) => [
                'id' => $organization->id,
                'name' => $organization->name,
            ])->values();
            $officerOrg = $user->officerProfile?->organization;
            if ($officerOrg && $organizationIds->contains($officerOrg->id) && ! $orgs->contains('id', $officerOrg->id)) {
                $orgs->push(['id' => $officerOrg->id, 'name' => $officerOrg->name]);
            }
            $role = trim((string) $user->officerProfile?->position) ?: 'Member';

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
                'is_officer' => $user->officerProfile !== null,
                'is_executive' => $this->isExecutiveRole($role),
                'organizations' => $orgs->pluck('name')->values(),
                'teams' => $user->assignedTasks->map(fn ($task) => $task->committee?->name)->filter()->unique()->values(),
                'profile_complete' => filled($user->name) && filled($user->email),
            ];
        })->values();

        $byOrganization = $members->flatMap(fn ($member) => $member['organizations']->map(fn ($name) => ['name' => $name]))
            ->groupBy('name')->map(fn ($rows, $name) => ['name' => $name, 'count' => $rows->count()])
            ->sortByDesc('count')->values();
        $executives = $members->filter(fn ($member) => $member['is_executive'])->take(4)->values();
        $completeProfiles = $members->where('profile_complete', true)->count();
        $availableUsers = User::query()
            ->whereDoesntHave('officerProfile')
            ->whereDoesntHave('organizations', fn ($query) => $query->whereIn('organizations.id', $organizationIds))
            ->orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('officer/members/index', [
            'members' => $members,
            'executives' => $executives,
            'organizations' => $organizations,
            'available_users' => $availableUsers,
            'analytics' => [
                'member_count' => $members->count(),
                'officer_count' => $members->where('is_officer', true)->count(),
                'executive_count' => $members->where('is_executive', true)->count(),
                'committee_count' => Committee::query()->whereIn('organization_id', $organizationIds)->count(),
                'profile_complete_percent' => $members->count() ? (int) round($completeProfiles / $members->count() * 100) : 0,
                'profile_complete_count' => $completeProfiles,
                'membership_by_type' => [
                    ['name' => 'Officers', 'count' => $members->where('is_officer', true)->count()],
                    ['name' => 'Members', 'count' => $members->where('is_officer', false)->count()],
                ],
                'by_organization' => $byOrganization,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $officer = $request->user()->officerProfile;
        abort_unless($officer, 403);
        $organizationIds = $officer->visibleOrganizationIds();
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'organization_id' => ['required', 'integer', Rule::in($organizationIds->all())],
        ]);

        $member = User::query()->whereDoesntHave('officerProfile')->findOrFail($data['user_id']);
        $member->organizations()->syncWithoutDetaching([$data['organization_id']]);

        AuditLog::create([
            'actor_type' => $request->user()->getMorphClass(),
            'actor_id' => $request->user()->id,
            'action' => 'membership.added_by_officer',
            'subject_type' => User::class,
            'subject_id' => $member->id,
            'organization_id' => $data['organization_id'],
            'metadata' => ['member' => $member->name],
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Member added to the organization.');
    }

    private function isExecutiveRole(string $role): bool
    {
        $normalized = strtolower($role);

        return str_contains($normalized, 'president')
            || preg_match('/\b(vp|secretary|treasurer)\b/', $normalized) === 1;
    }
}
