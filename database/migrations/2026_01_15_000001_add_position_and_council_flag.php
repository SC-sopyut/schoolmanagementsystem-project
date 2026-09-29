<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Every officer (including a President) already belongs to exactly one
        // organization via officers.organization_id. `position` is just their
        // title within it ("President", "Secretary", "Committee Head", ...).
        // The dashboard label is derived, never stored: "{organization.name} {position}".
        Schema::table('officers', function (Blueprint $table) {
            if (! Schema::hasColumn('officers', 'position')) {
                $table->string('position')->nullable()->after('organization_id');
            }
        });

        // Exactly one organization row (SSC) is flagged as the council. An officer
        // whose organization_id points at that row has council-wide scope; every
        // other officer is scoped to just their own organization_id. This one flag
        // is what turns a "BYTE President" into an org-scoped officer and an
        // "SSC President" into a platform-wide one, with no other code branching.
        Schema::table('organizations', function (Blueprint $table) {
            if (! Schema::hasColumn('organizations', 'is_council')) {
                $table->boolean('is_council')->default(false)->after('name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn('is_council');
        });

        Schema::table('officers', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }
};
