<?php

namespace App\Http\Middleware;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $account = $user instanceof User ? $user : null;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'officer' => ($officer = $account?->officerProfile) ? [
                    'label' => $officer->dashboardLabel(),
                    'organization' => $officer->organization?->name,
                    'position' => $officer->position,
                    'is_president' => strcasecmp((string) $officer->position, 'President') === 0,
                    'is_council' => (bool) $officer->organization?->is_council,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
            'notifications' => $account ? Announcement::query()
                ->visibleTo($account)
                ->whereNotNull('published_at')
                ->with('organization:id,name')
                ->latest('published_at')
                ->limit(5)
                ->get(['id', 'organization_id', 'title', 'body', 'published_at'])
                ->map(fn (Announcement $announcement) => [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'body' => $announcement->body,
                    'audience' => $announcement->audience,
                    'organization' => $announcement->organization?->name,
                    'published_at' => $announcement->published_at?->diffForHumans(),
                ]) : [],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
