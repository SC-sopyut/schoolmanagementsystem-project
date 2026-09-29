<?php

namespace App\Policies;

use App\Models\Concern;
use App\Models\User;

class ConcernPolicy
{
    public function create(User $user, int $organizationId): bool
    {
        return $user->organizations()->where('organizations.id', $organizationId)->exists();
    }

    public function view(User $user, Concern $concern): bool
    {
        if ($concern->student_id === $user->id) {
            return true;
        }

        return $this->review($user, $concern);
    }

    /**
     * An officer may review a concern if it belongs to an organization they can
     * see — their own org normally, or ANY org if they're council-scoped (see
     * Officer::visibleOrganizationIds(), driven by organizations.is_council).
     * This is the one place "BYTE President only sees BYTE" vs "SSC President
     * sees everything" is actually enforced; nothing upstream branches on position.
     */
    public function review(User $user, Concern $concern): bool
    {
        $officer = $user->officerProfile;

        return $officer !== null
            && $officer->visibleOrganizationIds()->contains($concern->organization_id);
    }

    public function forward(User $user, Concern $concern): bool
    {
        return $this->review($user, $concern) && $concern->status === 'reviewed';
    }
}
