<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Concern;
use App\Models\Document;
use App\Models\Event;
use App\Models\Task;
use App\Support\OrgScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $query = Str::of($request->query('q', ''))->squish()->limit(100, '')->toString();
        $user = $request->user();

        if (mb_strlen($query) < 2) {
            return response()->json(['results' => []]);
        }

        $term = '%'.$query.'%';
        $officer = $user->officerProfile;
        $organizationIds = OrgScope::idsFor($user);
        $results = collect();

        $announcements = Announcement::query()
            ->visibleTo($user)
            ->whereNotNull('published_at')
            ->where(fn ($builder) => $builder->where('title', 'like', $term)->orWhere('body', 'like', $term))
            ->with('organization:id,name')
            ->latest('published_at')->limit(5)->get();

        foreach ($announcements as $announcement) {
            $results->push($this->result(
                'Announcement', $announcement->title,
                $announcement->organization?->name ?? $this->audienceLabel($announcement->audience),
                $officer ? '/officer/announcements' : '/student/announcements'
            ));
        }

        $events = Event::query()
            ->where(fn ($builder) => $builder->whereNull('organization_id')->orWhereIn('organization_id', $organizationIds))
            ->where(fn ($builder) => $builder->where('title', 'like', $term)
                ->orWhere('description', 'like', $term)->orWhere('location', 'like', $term))
            ->with('organization:id,name')->latest('starts_at')->limit(5)->get();

        foreach ($events as $event) {
            $results->push($this->result(
                'Event', $event->title,
                $event->organization?->name ?? 'Council-wide event',
                $officer ? '/officer/events' : '/student/events'
            ));
        }

        $concerns = Concern::query()
            ->when($officer, fn ($builder) => $builder->whereIn('organization_id', $officer->visibleOrganizationIds()),
                fn ($builder) => $builder->where('student_id', $user->id))
            ->where(fn ($builder) => $builder->where('subject', 'like', $term)
                ->orWhere('body', 'like', $term)->orWhere('tracking_code', 'like', $term))
            ->with('organization:id,name')->latest()->limit(5)->get();

        foreach ($concerns as $concern) {
            $results->push($this->result(
                'Concern', $concern->subject,
                ($concern->organization?->name ?? 'Concern').' · '.$concern->tracking_code,
                $officer ? '/officer/concerns' : '/student/concerns'
            ));
        }

        if ($officer) {
            $documents = Document::query()
                ->where(fn ($builder) => $builder
                    ->where('access_level', 'public')
                    ->orWhereHas('folder', fn ($folderQuery) => $folderQuery->whereIn('organization_id', $organizationIds)))
                ->where('name', 'like', $term)
                ->with('folder:id,organization_id,name')->latest('updated_at')->limit(5)->get();

            foreach ($documents as $document) {
                $results->push($this->result(
                    'Document', $document->name, $document->folder?->name ?? 'Document repository',
                    '/documents?'.http_build_query(['folder' => $document->folder_id, 'doc' => $document->id])
                ));
            }

            $tasks = Task::query()
                ->whereHas('committee', fn ($builder) => $builder->whereIn('organization_id', $organizationIds))
                ->where(fn ($builder) => $builder->where('title', 'like', $term)->orWhere('description', 'like', $term))
                ->with('committee:id,name')->latest()->limit(5)->get();

            foreach ($tasks as $task) {
                $results->push($this->result('Task', $task->title, $task->committee?->name ?? 'Officer task board', '/officer/board'));
            }
        }

        return response()->json(['results' => $results->take(20)->values()]);
    }

    private function result(string $type, string $title, string $subtitle, string $url): array
    {
        return compact('type', 'title', 'subtitle', 'url');
    }

    private function audienceLabel(string $audience): string
    {
        return match ($audience) {
            Announcement::AUDIENCE_ALL_STUDENTS => 'Students in every organization',
            Announcement::AUDIENCE_ALL_OFFICERS => 'All officers',
            default => 'Everyone',
        };
    }
}
