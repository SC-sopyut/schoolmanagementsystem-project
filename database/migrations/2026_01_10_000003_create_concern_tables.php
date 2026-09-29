<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concerns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete(); // which org's officers see this first
            $table->string('subject');
            $table->text('body');
            // submitted -> reviewed -> forwarded (to the board/office) -> resolved
            $table->string('status')->default('submitted');
            $table->foreignId('reviewed_by')->nullable()->constrained('officers')->nullOnDelete();
            $table->text('officer_notes')->nullable();
            $table->timestamp('forwarded_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concerns');
    }
};
