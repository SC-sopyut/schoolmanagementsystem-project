<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Models\ConcernIdentityView;
use App\Models\Officer;
use App\Models\Organization;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $byStatus = Concern::query()
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $recentReveals = ConcernIdentityView::query()
            ->with(['admin:id,name', 'concern:id,tracking_code,subject'])
            ->latest('viewed_at')
            ->limit(5)
            ->get()
            ->map(fn (ConcernIdentityView $view) => [
                'id' => $view->id,
                'admin' => $view->admin?->name,
                'viewed_at' => $view->viewed_at,
                'tracking_code' => $view->concern?->tracking_code,
                'subject' => $view->concern?->subject,
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_concerns' => Concern::count(),
                'open_concerns' => Concern::whereIn('status', ['submitted', 'reviewed', 'forwarded'])->count(),
                'anonymous_concerns' => Concern::where('is_anonymous', true)->count(),
                'reveals_30d' => ConcernIdentityView::where('viewed_at', '>=', now()->subDays(30))->count(),
                'students' => User::whereDoesntHave('officerProfile')->count(),
                'officers' => Officer::count(),
                'organizations' => Organization::count(),
            ],
            'by_status' => collect(Concern::STATUSES)->map(fn (string $status) => [
                'status' => $status,
                'count' => (int) ($byStatus[$status] ?? 0),
            ]),
            'recent_reveals' => $recentReveals,
        ]);
    }
}
