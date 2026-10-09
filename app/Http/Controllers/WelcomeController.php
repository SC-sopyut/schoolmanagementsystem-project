<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function __invoke(): Response
    {
        $orgStats = Organization::query()
            ->select(['id', 'name'])
            ->withCount([
                'users',
                'events as upcoming_events_count' => fn (Builder $query) => $query
                    ->where('starts_at', '>=', now())
                    ->whereIn('status', ['planned', 'ongoing']),
            ])
            ->get()
            ->mapWithKeys(fn (Organization $organization) => [
                $organization->name => [
                    'members' => $organization->users_count,
                    'upcomingEvents' => $organization->upcoming_events_count,
                ],
            ]);

        return Inertia::render('welcome', [
            'orgStats' => $orgStats,
        ]);
    }
}
