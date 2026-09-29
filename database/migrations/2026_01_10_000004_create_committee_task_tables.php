<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('committees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('committee_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            // Kanban columns
            $table->string('status')->default('backlog'); // backlog|in_progress|review|done
            $table->date('due_date')->nullable();
            $table->foreignId('created_by')->constrained('officers')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('committees');
    }
};
