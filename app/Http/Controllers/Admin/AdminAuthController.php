<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use Laravel\Fortify\Fortify;

/**
 * Deliberately hand-rolled rather than routed through Fortify. Fortify is wired
 * to a single guard/provider (the student/officer 'users' table); running a
 * second, fully independent auth flow for admins through the same Fortify
 * instance isn't something it supports out of the box. This controller is
 * intentionally small: login, 2FA challenge, logout — no registration, no
 * self-service "forgot password" (admin resets are done by another admin
 * directly in the database/an internal tool, per your requirement of no
 * self-service reset for this account type).
 */
class AdminAuthController extends Controller
{
    public function showLogin(): Response
    {
        return Inertia::render('admin/auth/login');
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $throttleKey = 'admin-login:'.strtolower($credentials['email']).'|'.$request->ip();

        // Deliberately tighter than the student/officer throttle — this login
        // guards the identity-unmasking surface, so brute-force attempts are
        // cut off harder and faster.
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            throw ValidationException::withMessages([
                'email' => 'Too many attempts. Try again in a minute.',
            ]);
        }

        if (! Auth::guard('admin')->attempt($credentials, remember: false)) {
            RateLimiter::hit($throttleKey, 60);

            throw ValidationException::withMessages([
                'email' => 'Invalid credentials.',
            ]);
        }

        RateLimiter::clear($throttleKey);
        $request->session()->regenerate();

        $admin = Auth::guard('admin')->user();

        if ($admin->two_factor_secret && ! $request->session()->get('admin_2fa_confirmed')) {
            Auth::guard('admin')->logout();
            $request->session()->put('admin_2fa_pending_id', $admin->id);

            return redirect()->route('admin.two-factor.challenge');
        }

        return redirect()->route('admin.dashboard');
    }

    public function showTwoFactorChallenge(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('admin_2fa_pending_id')) {
            return redirect()->route('admin.login');
        }

        return Inertia::render('admin/auth/two-factor-challenge');
    }

    public function confirmTwoFactorChallenge(
        Request $request,
        TwoFactorAuthenticationProvider $provider,
    ): RedirectResponse {
        $data = $request->validate(['code' => ['required', 'digits:6']]);
        $adminId = $request->session()->get('admin_2fa_pending_id');
        $throttleKey = 'admin-2fa:'.$adminId.'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            throw ValidationException::withMessages(['code' => 'Too many attempts. Try again in a minute.']);
        }

        $admin = Admin::find($adminId);

        if (! $admin?->two_factor_secret || ! $provider->verify(Fortify::currentEncrypter()->decrypt($admin->two_factor_secret), $data['code'])) {
            RateLimiter::hit($throttleKey, 60);

            throw ValidationException::withMessages(['code' => 'The verification code is invalid.']);
        }

        RateLimiter::clear($throttleKey);
        Auth::guard('admin')->login($admin);
        $request->session()->forget('admin_2fa_pending_id');
        $request->session()->regenerate();

        return redirect()->route('admin.dashboard');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('admin')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
