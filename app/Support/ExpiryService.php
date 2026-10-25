<?php

namespace App\Support;

use App\Models\AuditLog;
use App\Models\Election;
use App\Models\Event;

/** Marks time-bound items expired the first time the application observes them past due. */
final class ExpiryService
{
    public static function sync(): void
    {
        Event::query()->whereIn('status', ['planned', 'ongoing'])->where('ends_at', '<', now())
            ->each(function (Event $event): void {
                $event->update(['status' => 'expired']);
                self::record(Event::class, $event->id, $event->organization_id, $event->title, $event->ends_at?->toIso8601String());
            });

        Election::query()->where('status', 'open')->where('ends_at', '<', now())
            ->each(function (Election $election): void {
                $election->update(['status' => 'expired']);
                self::record(Election::class, $election->id, $election->organization_id, $election->title, $election->ends_at?->toIso8601String());
            });
    }

    private static function record(string $type, int $id, ?int $organizationId, string $title, ?string $endedAt): void
    {
        AuditLog::create([
            'action' => class_basename($type) === 'Event' ? 'event.expired' : 'election.expired',
            'subject_type' => $type,
            'subject_id' => $id,
            'organization_id' => $organizationId,
            'metadata' => ['title' => $title, 'ended_at' => $endedAt, 'reason' => 'The scheduled end time passed.'],
        ]);
    }
}
