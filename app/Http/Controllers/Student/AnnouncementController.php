<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementRead;
use App\Support\OfficerScope;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        $user = OfficerScope::user(request()->user());

        $announcements = Announcement::query()
            ->visibleTo($user)
            ->whereNotNull('published_at')
            ->with(['organization:id,name', 'author.user:id,name'])
            ->withExists(['reads as is_read' => fn ($q) => $q->where('user_id', $user->id)])
            ->latest('published_at')
            ->paginate(15);

        return Inertia::render('student/announcements/index', [
            'announcements' => $announcements,
        ]);
    }

    /**
     * Record a read receipt.
     *
     * Idempotent by design: firstOrCreate on the (announcement_id, user_id) unique
     * pair means re-opening an already-read announcement never creates duplicate
     * receipts and never errors, so the frontend can safely call this every time
     * an announcement is opened without tracking local "have I already sent this"
     * state itself.
     */
    public function markRead(Announcement $announcement): RedirectResponse
    {
        $user = OfficerScope::user(request()->user());

        abort_unless(Announcement::visibleTo($user)->whereKey($announcement->id)->exists(), 403);

        AnnouncementRead::firstOrCreate(
            ['announcement_id' => $announcement->id, 'user_id' => $user->id],
            ['read_at' => now()]
        );

        return back();
    }
}
