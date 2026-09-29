<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // organization_id = NULL  => a council-wide (school-wide) election, open to every student
        // organization_id = <id>  => an internal org election, open only to that org's members
        Schema::create('elections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            // draft   -> not visible to students yet
            // open    -> voting window active
            // closed  -> voting window ended, results may be published
            $table->string('status')->default('draft');
            $table->timestamps();
        });

        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('position'); // e.g. "President", "Org Treasurer"
            $table->text('platform')->nullable();
            $table->timestamps();

            // a student can only run once per position, per election
            $table->unique(['election_id', 'user_id', 'position']);
        });

        Schema::create('votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_id')->constrained()->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // the voter
            $table->string('position'); // denormalized copy of candidates.position
            $table->timestamp('voted_at');
            $table->timestamps();

            // DB-level guarantee: one ballot per voter, per contested position, per election.
            // This is the real defense against double-voting, not just app logic.
            $table->unique(['election_id', 'user_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votes');
        Schema::dropIfExists('candidates');
        Schema::dropIfExists('elections');
    }
};
