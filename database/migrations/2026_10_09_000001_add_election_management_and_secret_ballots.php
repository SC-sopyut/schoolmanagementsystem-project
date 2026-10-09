<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('elections', function (Blueprint $table) {
            $table->json('positions')->nullable()->after('description');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('organization_id');
            $table->timestamp('results_published_at')->nullable()->after('ends_at');
        });

        Schema::create('vote_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('position');
            $table->timestamps();
            $table->unique(['election_id', 'user_id', 'position']);
        });

        Schema::create('ballots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_id')->constrained()->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained()->cascadeOnDelete();
            $table->string('position');
            $table->timestamps();
            $table->index(['election_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ballots');
        Schema::dropIfExists('vote_records');
        Schema::table('elections', function (Blueprint $table) {
            $table->dropConstrainedForeignId('created_by');
            $table->dropColumn(['positions', 'results_published_at']);
        });
    }
};
