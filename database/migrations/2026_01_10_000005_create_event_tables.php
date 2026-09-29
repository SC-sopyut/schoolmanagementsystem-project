<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            // NULL = school-wide Student Council event; otherwise a sub-org's own event
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->string('status')->default('planned'); // planned|ongoing|completed|cancelled
            $table->foreignId('created_by')->constrained('officers')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('event_attendees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('joined_at');
            $table->unique(['event_id', 'user_id']); // one RSVP per student per event
        });

        Schema::create('event_budget_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->decimal('estimated_cost', 10, 2)->default(0);
            $table->decimal('actual_cost', 10, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('event_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->boolean('is_done')->default(false);
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_checklist_items');
        Schema::dropIfExists('event_budget_items');
        Schema::dropIfExists('event_attendees');
        Schema::dropIfExists('events');
    }
};
