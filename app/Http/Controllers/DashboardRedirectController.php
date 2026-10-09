<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Replaces the starter kit's `dashboard` route target. Fortify sends everyone to
 * /dashboard after login (one shared login UI, per the auth design) - this is the
 * fork: officers land on the officer/president dashboard, everyone else on the
 * student dashboard. The role is decided server-side from the `officers` table.
 */
class DashboardRedirectController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        return $user instanceof User && $user->officerProfile
            ? redirect()->route('officer.dashboard')
            : redirect()->route('student.dashboard');
    }
}
