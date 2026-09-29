<?php

namespace App\Http\Controllers\Officer;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Officer;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(Request $request): Response
    {
        $officer = $request->user()->officerProfile()->with('organization')->firstOrFail();
        $organizationIds = $officer->visibleOrganizationIds();

        $announcements = Announcement::query()
            ->where(fn ($query) => $query->visibleTo($request->user())->orWhere('officer_id', $officer->id))
            ->whereNotNull('published_at')
            ->with(['organization:id,name', 'author.user:id,name'])
            ->latest('published_at')
            ->limit(30)
            ->get()
            ->map(fn (Announcement $announcement) => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'body' => $announcement->body,
                'audience' => $announcement->audience,
                'organization' => $announcement->organization?->name,
                'author' => $announcement->author?->user?->name,
                'published_at' => $announcement->published_at,
            ]);

        return Inertia::render('officer/announcements/index', [
            'organizations' => Organization::query()->whereIn('id', $organizationIds)->orderBy('name')->get(['id', 'name']),
            'is_council_officer' => (bool) $officer->organization?->is_council,
            'announcements' => $announcements,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var Officer $officer */
        $officer = $request->user()->officerProfile()->with('organization')->firstOrFail();
        $isCouncilOfficer = (bool) $officer->organization?->is_council;
        $allowedAudiences = $isCouncilOfficer
            ? [
                Announcement::AUDIENCE_ORGANIZATION,
                Announcement::AUDIENCE_ALL_STUDENTS,
                Announcement::AUDIENCE_ALL_OFFICERS,
                Announcement::AUDIENCE_EVERYONE,
            ]
            : [Announcement::AUDIENCE_ORGANIZATION];

        $data = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'body' => ['required', 'string', 'max:10000'],
            'audience' => ['required', Rule::in($allowedAudiences)],
            'organization_id' => [
                Rule::requiredIf(fn () => $request->input('audience') === Announcement::AUDIENCE_ORGANIZATION),
                'nullable', 'integer', Rule::in($officer->visibleOrganizationIds()->all()),
            ],
        ]);

        if ($data['audience'] === Announcement::AUDIENCE_ORGANIZATION && ! $isCouncilOfficer) {
            abort_unless((int) $data['organization_id'] === (int) $officer->organization_id, 403);
        }

        Announcement::create([
            'organization_id' => $data['audience'] === Announcement::AUDIENCE_ORGANIZATION ? $data['organization_id'] : null,
            'officer_id' => $officer->id,
            'title' => $data['title'],
            'body' => $data['body'],
            'audience' => $data['audience'],
            'published_at' => now(),
        ]);

        return back()->with('success', 'Announcement published.');
    }
}
