<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('event_attendance_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_attendee_id')->constrained()->cascadeOnDelete();
            $table->timestamp('checked_in_at');
            $table->foreignId('checked_in_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('checked_out_at')->nullable();
            $table->foreignId('checked_out_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['event_attendee_id', 'checked_in_at']);
        });

        DB::table('event_attendees')
            ->whereNotNull('checked_in_at')
            ->orderBy('id')
            ->each(function (object $attendee): void {
                DB::table('event_attendance_sessions')->insert([
                    'event_attendee_id' => $attendee->id,
                    'checked_in_at' => $attendee->checked_in_at,
                    'checked_in_by' => $attendee->checked_in_by,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_attendance_sessions');
    }
};
