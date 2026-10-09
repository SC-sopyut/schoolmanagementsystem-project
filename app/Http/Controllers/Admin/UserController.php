<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
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
