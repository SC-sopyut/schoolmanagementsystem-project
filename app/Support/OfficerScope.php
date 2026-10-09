<?php

namespace App\Support;

use App\Models\Officer;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;

/** Type-safe access to the authenticated officer account and profile. */
final class OfficerScope
{
    public static function user(?Authenticatable $authenticated): User
    {
        abort_unless($authenticated instanceof User, 403);

        return $authenticated;
    }

    public static function profile(?Authenticatable $authenticated): Officer
    {
        $officer = self::user($authenticated)->officerProfile;
        abort_unless($officer instanceof Officer, 403);

        return $officer;
    }
}
