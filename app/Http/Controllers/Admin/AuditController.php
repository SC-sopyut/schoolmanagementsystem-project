<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConcernIdentityView;
use Inertia\Inertia;
use Inertia\Response;

class AuditController extends Controller
{
    public function index(): Response
    {
        $reveals = ConcernIdentityView::query()
            ->with(['admin:id,name', 'concern:id,tracking_code,subject'])
            ->latest('viewed_at')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (ConcernIdentityView $view) => [
                'id' => $view->id,
                'admin' => $view->admin?->name,
                'viewed_at' => $view->viewed_at,
                'tracking_code' => $view->concern?->tracking_code,
                'subject' => $view->concern?->subject,
            ]);

        return Inertia::render('admin/audit/index', ['reveals' => $reveals]);
    }
}
