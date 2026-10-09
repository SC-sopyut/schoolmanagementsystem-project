<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Concern;
use App\Models\ConcernIdentityView;
use App\Models\Document;
use App\Models\Event;
use App\Models\Officer;
use App\Models\Organization;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\DB;
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
        $taskStatusCounts = Task::query()
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');
        $monthExpression = match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', created_at)",
            'pgsql' => "TO_CHAR(created_at, 'YYYY-MM')",
            'sqlsrv' => "FORMAT(created_at, 'yyyy-MM')",
            default => "DATE_FORMAT(created_at, '%Y-%m')",
        };
        $chartStart = now()->startOfMonth()->subMonths(11);
        $taskTrend = Task::query()->where('created_at', '>=', $chartStart)
            ->selectRaw("{$monthExpression} as month, COUNT(*) as aggregate")
            ->groupByRaw($monthExpression)->pluck('aggregate', 'month');
        $concernTrend = Concern::query()->where('created_at', '>=', $chartStart)
            ->selectRaw("{$monthExpression} as month, COUNT(*) as aggregate")
            ->groupByRaw($monthExpression)->pluck('aggregate', 'month');
        $monthlyActivity = collect(range(0, 11))->map(function (int $offset) use ($chartStart, $taskTrend, $concernTrend): array {
            $month = $chartStart->copy()->addMonths($offset);
            $key = $month->format('Y-m');

            return [
                'month' => $month->format('M'), 'key' => $key,
                'tasks' => (int) ($taskTrend[$key] ?? 0),
                'concerns' => (int) ($concernTrend[$key] ?? 0),
            ];
        });

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
                'tasks' => Task::count(),
                'open_tasks' => Task::where('status', '!=', 'done')->count(),
                'events' => Event::count(),
                'upcoming_events' => Event::where('starts_at', '>=', now())->whereIn('status', ['planned', 'ongoing'])->count(),
                'documents' => Document::count(),
            ],
            'by_status' => collect(Concern::STATUSES)->map(fn (string $status) => [
                'status' => $status,
                'count' => (int) ($byStatus[$status] ?? 0),
            ]),
            'analytics' => [
                'tasks_by_status' => collect(Task::STATUSES)->map(fn (string $status) => ['status' => $status, 'count' => (int) ($taskStatusCounts[$status] ?? 0)]),
                'concerns_by_status' => collect(Concern::STATUSES)->map(fn (string $status) => ['status' => $status, 'count' => (int) ($byStatus[$status] ?? 0)]),
                'monthly_activity' => $monthlyActivity,
            ],
            'recent_reveals' => $recentReveals,
            'recent_activity' => AuditLog::query()->with(['actor', 'organization:id,name'])->recent()->limit(6)->get()
                ->map(fn (AuditLog $log) => [
                    'id' => $log->id, 'actor' => $log->actorName() ?? 'System',
                    'action' => $log->action, 'organization' => $log->organization?->name,
                    'detail' => $log->metadata['name'] ?? $log->metadata['title'] ?? $log->metadata['user'] ?? $log->metadata['tracking_code'] ?? null,
                    'created_at' => $log->created_at,
                ]),
            'deleted_uploads' => AuditLog::query()
                ->where('action', 'document.deleted')
                ->where('subject_type', Document::class)
                ->with(['actor', 'organization:id,name'])
                ->recent()->limit(5)->get()
                ->map(fn (AuditLog $log) => [
                    'id' => $log->id,
                    'name' => $log->metadata['name'] ?? 'Deleted document',
                    'versions' => (int) ($log->metadata['versions'] ?? 1),
                    'actor' => $log->actorName() ?? 'Unknown user',
                    'organization' => $log->organization?->name,
                    'deleted_at' => $log->created_at,
                ]),
        ]);
    }
}
