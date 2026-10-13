<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudentApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $profile = $user instanceof User ? $user->studentProfile : null;

        if ($user instanceof User && ! $user->officerProfile && $profile && $profile->status !== 'approved') {
            Inertia::flash('toast', ['type' => 'warning', 'message' => 'Your account is pending student-ID verification. You cannot use this feature until an administrator approves it.']);

            return back();
        }

        return $next($request);
    }
}
