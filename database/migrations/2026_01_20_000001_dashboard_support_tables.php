<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Kanban cards show a priority pill (Low / Medium / High) in the Figma.
        Schema::table('tasks', function (Blueprint $table) {
            if (! Schema::hasColumn('tasks', 'priority')) {
                $table->string('priority')->default('medium')->after('status');
            }
        });

        // "Recent Actions" feed on the officer dashboard. Written to explicitly
        // (FeedItem::record) so the feed only contains things we chose to expose.
        Schema::create('feed_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('message');
            $table->timestamp('created_at')->useCurrent();
        });

        // Document repository: folder tree -> documents -> immutable versions.
        Schema::create('document_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('document_folders')->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('folder_id')->constrained('document_folders')->cascadeOnDelete();
            $table->string('name');
            $table->string('file_type', 10);
            // public   = any signed-in user   |  org_only = members/officers of the folder's org
            $table->string('access_level')->default('org_only');
            $table->unsignedInteger('current_version')->default(1);
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamps();
        });

        Schema::create('document_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('version');
            $table->string('path');           // server-generated (uuid); never the client filename
            $table->unsignedBigInteger('size');
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['document_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_versions');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('document_folders');
        Schema::dropIfExists('feed_items');
        Schema::table('tasks', fn (Blueprint $t) => $t->dropColumn('priority'));
    }
};
