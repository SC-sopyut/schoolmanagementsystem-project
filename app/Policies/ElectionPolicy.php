<?php

namespace App\Policies;

use App\Models\Election;
use App\Models\User;

class ElectionPolicy extends VotePolicy
{
    public function create(User $user, ?int $organizationId): bool
    {
        $officer = $user->officerProfile;
        if ($officer === null) return false;
        if ($organizationId === null) return (bool) ($officer->organization?->is_council);
        return $officer->visibleOrganizationIds()->contains($organizationId);
    }

    public function manage(User $user, Election $election): bool
    {
        return $this->create($user, $election->organization_id)
            && ! $election->candidates()->where('user_id', $user->id)->exists();
    }
}
