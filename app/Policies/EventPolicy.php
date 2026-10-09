<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    /**
     * A council-wide event (organization_id = null on the Event) may only be
     * planned by an officer whose own organization is flagged is_council (the
     * SSC President's org). A sub-org event requires that officer's org to
     * match, or — same rule as concerns — council-scoped officers may plan for
     * any sub-org too, since their visibility spans everything.
     */
    public function plan(User $user, ?int $organizationId): bool
    {
        $officer = $user->officerProfile;

        if ($officer === null) {
            return false;
        }

        if ($organizationId === null) {
            return (bool) ($officer->organization->is_council ?? false);
        }

        return $organizationId > 0 && $officer->visibleOrganizationIds()->contains($organizationId);
    }

    public function managePlanning(User $user, Event $event): bool
    {
        return $this->plan($user, $event->organization_id);
    }

    public function join(User $user, Event $event): bool
    {
        if ($event->isCouncilWide()) {
            return true;
        }

        return $user->organizations()->where('organizations.id', $event->organization_id)->exists();
    }
}
