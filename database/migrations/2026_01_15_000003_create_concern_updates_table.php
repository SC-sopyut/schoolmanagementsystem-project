<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The "My Concerns" screen shows a custom-labelled timeline (e.g. "Concern
     * Received" -> "Officer Assigned" -> "Scheduled Maintenance") plus threaded
     * officer replies, not just a fixed status enum. concerns.status stays as
     * the coarse filter (submitted/reviewed/forwarded/resolved) that drives the
     * All/Open/In Progress/Resolved tabs; concern_updates is the append-only
     * timeline of stage labels + optional messages actually rendered per concern.
     */
    public function up(): void
    {
        Schema::create('concern_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('concern_id')->constrained()->cascadeOnDelete();
            // null officer_id = system-generated stage (e.g. "Concern Received" on submit)
            $table->foreignId('officer_id')->nullable()->constrained('officers')->nullOnDelete();
            $table->string('stage_label'); // free text, officer-authored: "Scheduled Maintenance"
            $table->text('message')->nullable(); // the quoted reply shown to the student
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concern_updates');
    }
};
