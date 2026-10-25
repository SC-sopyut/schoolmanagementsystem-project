<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('email', 'not like', '%@acc.edu.ph')
            ->orderBy('id')
            ->get(['id', 'email'])
            ->each(function (object $user): void {
                $schoolEmail = Str::before($user->email, '@').'@acc.edu.ph';

                if (! DB::table('users')->where('email', $schoolEmail)->exists()) {
                    DB::table('users')->where('id', $user->id)->update(['email' => $schoolEmail]);
                }
            });
    }

    public function down(): void
    {
        // Original external domains cannot be reconstructed safely.
    }
};
