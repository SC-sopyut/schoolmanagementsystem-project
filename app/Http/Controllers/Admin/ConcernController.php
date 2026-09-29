<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Models\ConcernIdentityView;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ConcernController extends Controller
{
    /**
     * Platform-wide list, across every organization, with no redaction — this
     * is the one screen in the whole system where is_anonymous is bypassed.
     * The list view itself only needs enough to triage (org, status, priority,
     * whether it's anonymous); the real name is only pulled, and only logged,
     * when a specific concern is opened via show().
     */
    public function index(): Response
    {
        $concerns = Concern::query()
            ->with('organization:id,name')
            ->latest()
            ->get()
            ->map(fn (Concern $c) => [
                'id' => $c->id,
                'tracking_code' => $c->tracking_code,
                'subject' => $c->subject,
                'organization' => $c->organization?->name,
                'category' => $c->category,
                'priority' => $c->priority,
                'status' => $c->status,
                'is_anonymous' => $c->is_anonymous,
            ]);

        return Inertia::render('admin/concerns/index', ['concerns' => $concerns]);
    }

    /**
     * Opening a single concern is where real identity actually gets read and
     * shown — and where the audit row is written, in the same transaction, so
     * there is no code path that reveals a name without also logging it.
     */
    public function show(Concern $concern): Response
    {
        $admin = request()->user('admin');

        $payload = DB::transaction(function () use ($concern, $admin) {
            ConcernIdentityView::create([
                'admin_id' => $admin->id,
                'concern_id' => $concern->id,
                'viewed_at' => now(),
            ]);

            $concern->load(['student:id,name,email', 'organization:id,name', 'updatesTimeline.officer.user:id,name']);

            return $concern;
        });

        return Inertia::render('admin/concerns/show', [
            'concern' => $payload,
            // shown in the UI so the admin sees their own action was recorded —
            // reinforces that this isn't a silent read.
            'identity_view_logged_at' => now(),
        ]);
    }
}
