<?php

namespace App\Http\Middleware;

use App\Support\OfficerScope;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gates every officer/* route behind an actual row in the `officers` table.
 * This is the coarse role check; fine-grained "officer of WHICH org" checks
 * still happen per-action via the Policies (ConcernPolicy, TaskPolicy, EventPolicy),
 * since being an officer somewhere does not mean being an officer everywhere.
 *
 * Register as 'is_officer' in bootstrap/app.php:
 *   ->withMiddleware(fn ($m) => $m->alias(['is_officer' => EnsureUserIsOfficer::class]))
 */
class EnsureUserIsOfficer
{
    public function handle(Request $request, Closure $next): Response
    {
        OfficerScope::profile($request->user());

        return $next($request);
    }
}
