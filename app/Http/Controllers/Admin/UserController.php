<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function pending(Request $request): Response
    {
        $request->validate(['q' => ['nullable', 'string', 'max:120']]);
        $search = trim((string) $request->query('q', ''));
        $pattern = '%'.$search.'%';
        $registrations = StudentProfile::query()
            ->where('status', 'pending')
            ->with('user:id,name,email')
            ->oldest()
            ->get()
            ->map(fn (StudentProfile $profile) => [
                'user_id' => $profile->user_id,
                'student_id_no' => $profile->student_id_no,
                'name' => $profile->user?->name,
                'email' => $profile->user?->email,
                'course' => $profile->course,
                'year_level' => $profile->year_level,
                'registered_at' => $profile->created_at,
            ]);

        $approvedStudents = StudentProfile::query()
            ->where('status', 'approved')
            ->with(['user:id,name,email', 'verifier:id,name'])
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $query) use ($pattern) {
                $query->where('student_id_no', 'like', $pattern)
                    ->orWhere('course', 'like', $pattern)
                    ->orWhereHas('user', fn (Builder $user) => $user->where('name', 'like', $pattern)->orWhere('email', 'like', $pattern));
            }))
            ->latest('verified_at')
            ->paginate(30, ['*'], 'approved_page')
            ->withQueryString()
            ->through(fn (StudentProfile $profile) => [
                'student_id_no' => $profile->student_id_no,
                'name' => $profile->user?->name,
                'email' => $profile->user?->email,
                'course' => $profile->course,
                'year_level' => $profile->year_level,
                'verified_at' => $profile->verified_at,
                'verified_by' => $profile->verifier?->name ?? 'Unknown administrator',
            ]);

        return Inertia::render('admin/pending-registrations/index', [
            'registrations' => $registrations,
            'approvedStudents' => $approvedStudents,
            'filters' => ['q' => $search],
        ]);
    }

    public function approve(Request $request, User $user): RedirectResponse
    {
        $profile = $user->studentProfile;
        abort_unless($profile?->status === 'pending', 404);
        $admin = $request->user('admin');
        abort_unless($admin instanceof Admin, 403);

        $profile->update(['status' => 'approved', 'verified_at' => now(), 'verified_by' => $admin->id]);
        $this->assignHomeOrganization($user, $profile);
        AuditLog::create([
            'actor_type' => $admin->getMorphClass(), 'actor_id' => $admin->id,
            'action' => 'student_registration.approved', 'subject_type' => User::class, 'subject_id' => $user->id,
            'metadata' => ['name' => $user->name, 'student_id_no' => $profile->student_id_no], 'ip_address' => $request->ip(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Student registration approved.']);

        return back();
    }

    public function approveAll(Request $request): RedirectResponse
    {
        $admin = $request->user('admin');
        abort_unless($admin instanceof Admin, 403);

        $profiles = StudentProfile::query()->where('status', 'pending')->with('user:id,name')->get();
        if ($profiles->isEmpty()) {
            Inertia::flash('toast', ['type' => 'info', 'message' => 'There are no pending registrations to approve.']);

            return back();
        }

        DB::transaction(function () use ($admin, $profiles, $request): void {
            foreach ($profiles as $profile) {
                $profile->update(['status' => 'approved', 'verified_at' => now(), 'verified_by' => $admin->id]);
                $this->assignHomeOrganization($profile->user, $profile);
                AuditLog::create([
                    'actor_type' => $admin->getMorphClass(), 'actor_id' => $admin->id,
                    'action' => 'student_registration.approved', 'subject_type' => User::class, 'subject_id' => $profile->user_id,
                    'metadata' => ['name' => $profile->user?->name, 'student_id_no' => $profile->student_id_no, 'bulk_approval' => true],
                    'ip_address' => $request->ip(),
                ]);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$profiles->count()} student registrations approved."]);

        return back();
    }

    private function assignHomeOrganization(?User $user, StudentProfile $profile): void
    {
        $homeOrganization = $profile->homeOrganizationName();
        if ($user && $homeOrganization) {
            $organizationId = Organization::query()->where('name', $homeOrganization)->value('id');
            if ($organizationId) {
                $user->organizations()->syncWithoutDetaching([$organizationId]);
            }
        }
    }

    public function reject(Request $request, User $user): RedirectResponse
    {
        $profile = $user->studentProfile;
        abort_unless($profile?->status === 'pending', 404);
        $admin = $request->user('admin');
        abort_unless($admin instanceof Admin, 403);
        $snapshot = ['name' => $user->name, 'student_id_no' => $profile->student_id_no];
        $user->delete();
        AuditLog::create([
            'actor_type' => $admin->getMorphClass(), 'actor_id' => $admin->id,
            'action' => 'student_registration.rejected', 'subject_type' => User::class, 'subject_id' => $user->id,
            'metadata' => $snapshot, 'ip_address' => $request->ip(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Registration rejected and the school ID is available for its rightful owner.']);

        return back();
    }

    public function index(Request $request): Response
    {
        $request->validate(['q' => ['nullable', 'string', 'max:120']]);
        $search = trim((string) $request->query('q', ''));
        $pattern = '%'.$search.'%';
        $users = User::query()
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $query) use ($pattern) {
                $query->where('name', 'like', $pattern)
                    ->orWhere('email', 'like', $pattern)
                    ->orWhereHas('officerProfile', fn (Builder $officer) => $officer
                        ->where('position', 'like', $pattern)
                        ->orWhereHas('organization', fn (Builder $organization) => $organization->where('name', 'like', $pattern)))
                    ->orWhereHas('organizations', fn (Builder $organization) => $organization->where('name', 'like', $pattern));
            }))
            ->with(['officerProfile.organization:id,name', 'organizations:id,name'])
            ->orderBy('name')->paginate(30)->withQueryString()->through(fn (User $user) => [
                'id' => $user->id, 'name' => $user->name, 'email' => $user->email,
                'type' => $user->officerProfile ? 'Officer' : 'Student',
                'organization' => collect([$user->officerProfile?->organization?->name])
                    ->merge($user->organizations->pluck('name'))->filter()->unique()->join(', '),
                'position' => $user->officerProfile?->position,
                'joined_at' => $user->created_at,
            ]);

        return Inertia::render('admin/users/index', ['users' => $users, 'filters' => ['q' => $search]]);
    }

    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:12', 'confirmed'],
        ]);

        $user->update(['password' => $validated['password']]);

        $admin = $request->user('admin');
        abort_unless($admin instanceof Admin, 403);
        AuditLog::create([
            'actor_type' => $admin->getMorphClass(),
            'actor_id' => $admin->id,
            'action' => 'user.password_reset',
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'metadata' => ['email' => $user->email],
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Password updated. Share the new password with the user securely.');
    }
}
