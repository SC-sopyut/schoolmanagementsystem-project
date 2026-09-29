<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Deliberately its own table, not a flag on `users` — admins (you, as the
        // developer/IT custodian) are not students and never go through the
        // student/officer login form. No email-verification or self-service
        // password-reset columns/flows are wired for this table by design.
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            // Fortify's TwoFactorAuthenticatable trait expects these three columns.
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // Audit trail: every time an admin views the real identity behind an
        // anonymous concern, it's logged here. This is what you'd point to if
        // anyone ever asks "who can see anonymous reports, and is it tracked".
        Schema::create('concern_identity_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained()->cascadeOnDelete();
            $table->foreignId('concern_id')->constrained()->cascadeOnDelete();
            $table->timestamp('viewed_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concern_identity_views');
        Schema::dropIfExists('admins');
    }
};
