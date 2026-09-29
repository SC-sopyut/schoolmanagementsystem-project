<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gates every /admin/* route. Uses the 'admin' guard exclusively — a logged-in
 * student or officer session on the default 'web' guard has zero effect here,
 * and vice versa. Register as an alias in bootstrap/app.php:
 *   ->withMiddleware(fn ($m) => $m->alias(['is_admin' => EnsureAdmin::class]))
 * and apply it alongside `auth:admin` (see routes/admin.php).
 */
class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user('admin') !== null, 403);

        return $next($request);
    }
}
