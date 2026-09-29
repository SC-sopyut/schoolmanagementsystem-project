<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Collection;

/**
 * One place that answers "which organizations can this user see?".
 *  - Officer       -> Officer::visibleOrganizationIds() (own org, or every org for the SSC/council officer)
 *  - Plain student -> the organizations they are a member of
 * An officer is also a student, so an officer's own memberships are merged in.
 */
class OrgScope
{
    public static function idsFor(User $user): Collection
    {
        $member = $user->organizations()->pluck('organizations.id');
        $officer = $user->officerProfile;

        return $officer
            ? $officer->visibleOrganizationIds()->merge($member)->unique()->values()
            : $member;
    }

    /** Stable colour bucket for an org/committee tag, so the same name always gets the same colour. */
    public static function tone(string $name): string
    {
        $tones = ['orange', 'purple', 'red', 'gray', 'green', 'blue'];

        return $tones[crc32(mb_strtolower($name)) % count($tones)];
    }
}
