<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AuditLog;
use App\Models\ConcernIdentityView;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate(['q' => ['nullable', 'string', 'max:120']]);
        $search = trim((string) $request->query('q', ''));
        $pattern = '%'.$search.'%';

        $revealsQuery = ConcernIdentityView::query()
            ->with(['admin:id,name', 'concern:id,tracking_code,subject'])
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $query) use ($pattern) {
                $query->whereHas('admin', fn (Builder $admin) => $admin->where('name', 'like', $pattern))
                    ->orWhereHas('concern', fn (Builder $concern) => $concern
                        ->where('tracking_code', 'like', $pattern)
                        ->orWhere('subject', 'like', $pattern));
            }));
        $reveals = $revealsQuery->latest('viewed_at')
            ->paginate(25, ['*'], 'page')
            ->withQueryString()
            ->through(fn (ConcernIdentityView $view) => [
                'id' => $view->id,
                'admin' => $view->admin?->name,
                'viewed_at' => $view->viewed_at,
                'tracking_code' => $view->concern?->tracking_code,
                'subject' => $view->concern?->subject,
            ]);

        $activityQuery = AuditLog::query()
            ->with(['actor', 'organization:id,name'])
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $query) use ($pattern) {
                $query->where('action', 'like', $pattern)
                    ->orWhere('subject_type', 'like', $pattern)
                    ->orWhere('ip_address', 'like', $pattern)
                    ->orWhere('metadata', 'like', $pattern)
                    ->orWhereHas('organization', fn (Builder $organization) => $organization->where('name', 'like', $pattern))
                    ->orWhereHasMorph('actor', [Admin::class, User::class], fn (Builder $actor) => $actor->where('name', 'like', $pattern));
            }));
        $activity = $activityQuery->recent()->paginate(25, ['*'], 'activity_page')->withQueryString()
            ->through(fn (AuditLog $log) => [
                'id' => $log->id, 'action' => $log->action,
                'actor' => $log->actorName() ?? 'System', 'actor_type' => class_basename($log->actor_type ?? 'System'),
                'organization_id' => $log->organization_id, 'subject_type' => class_basename($log->subject_type ?? ''),
                'organization' => $log->organization?->name,
                'subject_id' => $log->subject_id, 'metadata' => $log->metadata,
                'ip_address' => $log->ip_address, 'created_at' => $log->created_at,
            ]);

        return Inertia::render('admin/audit/index', [
            'reveals' => $reveals,
            'activity' => $activity,
            'filters' => ['q' => $search],
        ]);
    }
}
