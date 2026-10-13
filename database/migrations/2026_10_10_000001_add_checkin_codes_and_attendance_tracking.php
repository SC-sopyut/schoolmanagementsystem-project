<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('checkin_code', 64)->nullable()->unique()->after('email');
        });

        DB::table('users')->whereNull('checkin_code')->orderBy('id')->each(function (object $user): void {
            DB::table('users')->where('id', $user->id)->update(['checkin_code' => Str::random(40)]);
        });

        Schema::table('event_attendees', function (Blueprint $table) {
            $table->timestamp('checked_in_at')->nullable()->after('joined_at');
            $table->foreignId('checked_in_by')->nullable()->after('checked_in_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('event_attendees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('checked_in_by');
            $table->dropColumn('checked_in_at');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['checkin_code']);
            $table->dropColumn('checkin_code');
        });
    }
};
