<?php

namespace App\Services;

use App\Models\User;

class StudentScanResolver
{
    /**
     * Resolve an opaque CouncilForge QR value to a student account.
     *
     * When campus ID QR codes are approved, extend this one method to try the
     * official student ID value after the internal check-in code.
     */
    public function resolveStudentFromScan(string $value): ?User
    {
        return User::query()
            ->where('checkin_code', trim($value))
            ->where(function ($query): void {
                $query->whereDoesntHave('studentProfile')
                    ->orWhereHas('studentProfile', fn ($profile) => $profile->where('status', 'approved'));
            })
            ->first();
    }
}
