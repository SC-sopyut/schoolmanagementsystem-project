<?php

namespace App\Policies;

use App\Models\Election;
use App\Models\User;

class VotePolicy
{
    /**
     * Can this user cast a ballot in this election right now?
     *
     * Checks, in order:
     *  1. The election is actually open (status + time window) - blocks early/late voting
     *     even if someone hits the endpoint directly.
     *  2. Eligibility: council-wide elections are open to every student; org elections
     *     require active membership in that organization (assumes User::organizations()
     *     belongsToMany relation from the multi-org membership design).
     *  3. The user has not already voted for this specific contested position
     *     (belt-and-suspenders on top of the DB unique constraint in VoteController).
     */
    public function vote(User $user, Election $election, string $position): bool
    {
        if (! $election->isOpenForVoting()) {
            return false;
        }

        if (! $election->isCouncilWide()) {
            $isMember = $user->organizations()
                ->where('organizations.id', $election->organization_id)
                ->exists();

            if (! $isMember) {
                return false;
            }
        }

        $alreadyVoted = $election->votes()
            ->where('user_id', $user->id)
            ->where('position', $position)
            ->exists();

        return ! $alreadyVoted;
    }
}
