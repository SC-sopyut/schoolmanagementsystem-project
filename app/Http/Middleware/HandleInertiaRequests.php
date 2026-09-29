<?php

namespace App\Http\Middleware;

use App\Models\Announcement;
use App\Models\Concern;
use App\Models\Event;
use App\Models\User;
use App\Support\OrgScope;
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
        $notifications = $account ? [
            'announcements' => Announcement::query()
                ->visibleTo($account)
                ->whereNotNull('published_at')
                ->with('organization:id,name')
                ->latest('published_at')
                ->limit(5)
                ->get(['id', 'organization_id', 'title', 'body', 'audience', 'published_at'])
                ->map(fn (Announcement $announcement) => [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'body' => $announcement->body,
                    'audience' => $announcement->audience,
                    'organization' => $announcement->organization?->name,
                    'published_at' => $announcement->published_at?->diffForHumans(),
                    'url' => $account->officerProfile ? '/officer/announcements' : '/student/announcements',
                ])->values(),
            'upcoming_events' => Event::query()
                ->where(fn ($query) => $query->whereNull('organization_id')->orWhereIn('organization_id', OrgScope::idsFor($account)))
                ->whereIn('status', ['planned', 'ongoing'])
                ->where('starts_at', '>=', now())
                ->with('organization:id,name')
                ->orderBy('starts_at')
                ->limit(5)
                ->get(['id', 'organization_id', 'title', 'location', 'starts_at'])
                ->map(fn (Event $event) => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'body' => trim(($event->starts_at?->format('M j, g:i A') ?? '').($event->location ? ' · '.$event->location : '')),
                    'organization' => $event->organization?->name ?? 'Council-wide event',
                    'published_at' => $event->starts_at?->diffForHumans(),
                    'url' => $account->officerProfile ? '/officer/events' : '/student/events',
                ])->values(),
            'concern_updates' => Concern::query()
                ->where('student_id', $account->id)
                ->with(['organization:id,name', 'updatesTimeline'])
                ->latest('updated_at')
                ->limit(5)
                ->get()
                ->map(function (Concern $concern) {
                    $update = $concern->updatesTimeline->last();

                    return [
                        'id' => $concern->id,
                        'title' => $concern->subject,
                        'body' => trim(($update?->stage_label ?? ucfirst($concern->status)).($update?->message ? ' · '.$update->message : '')),
                        'tracking_code' => $concern->tracking_code,
                        'organization' => $concern->organization?->name,
                        'published_at' => $concern->updated_at?->diffForHumans(),
                        'url' => '/student/concerns',
                    ];
                })->values(),
        ] : ['announcements' => [], 'upcoming_events' => [], 'concern_updates' => []];

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
            'notifications' => $notifications,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
