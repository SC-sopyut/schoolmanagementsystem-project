<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\User;
use App\Support\OfficerScope;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = OfficerScope::user($request->user());

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = OfficerScope::user($request->user());
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    public function updateAvatar(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $user = OfficerScope::user($request->user());
        $previousPath = $user->avatar_path;
        $user->avatar_path = $validated['avatar']->storePublicly('avatars', 'public');
        $user->save();

        if ($previousPath) {
            Storage::disk('public')->delete($previousPath);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Profile photo updated.']);

        return to_route('profile.edit');
    }

    public function deleteAvatar(Request $request): RedirectResponse
    {
        $user = OfficerScope::user($request->user());
        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
            $user->avatar_path = null;
            $user->save();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Profile photo removed.']);

        return to_route('profile.edit');
    }

    public function avatar(User $user): BinaryFileResponse
    {
        abort_unless($user->avatar_path && Storage::disk('public')->exists($user->avatar_path), 404);

        return response()->file(Storage::disk('public')->path($user->avatar_path), [
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = OfficerScope::user($request->user());

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
