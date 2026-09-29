<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->string('audience', 32)->default('organization')->after('organization_id');
        });

        DB::table('announcements')->whereNull('organization_id')->update(['audience' => 'everyone']);
    }

    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropColumn('audience');
        });
    }
};
