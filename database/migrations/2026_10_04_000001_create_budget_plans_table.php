<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('officers')->cascadeOnDelete();
            $table->string('title', 150);
            $table->string('category', 100);
            $table->decimal('amount', 12, 2);
            $table->date('period_start');
            $table->date('period_end');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['organization_id', 'period_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_plans');
    }
};
