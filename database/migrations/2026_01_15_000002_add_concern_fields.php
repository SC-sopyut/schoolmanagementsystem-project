<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('concerns', function (Blueprint $table) {
            // student_id (on the base table) is NEVER nullable — anonymity only
            // controls what officers are shown, not what the system stores.
            if (! Schema::hasColumn('concerns', 'is_anonymous')) {
                $table->boolean('is_anonymous')->default(false)->after('student_id');
            }

            if (! Schema::hasColumn('concerns', 'category')) {
                $table->string('category')->after('subject');
            }

            if (! Schema::hasColumn('concerns', 'priority')) {
                $table->string('priority')->default('medium')->after('category');
            }

            // Human-readable receipt shown to the student, e.g. CON-2026-0147.
            // Generated server-side on create (see Concern::booted()) — never
            // client-supplied, so it can't be guessed/spoofed to look up someone
            // else's concern.
            if (! Schema::hasColumn('concerns', 'tracking_code')) {
                $table->string('tracking_code')->unique()->nullable()->after('id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('concerns', function (Blueprint $table) {
            $table->dropColumn(['is_anonymous', 'category', 'priority', 'tracking_code']);
        });
    }
};
