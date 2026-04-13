<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('site_contents')) {
            return;
        }

        Schema::table('site_contents', function (Blueprint $table) {
            if (! Schema::hasColumn('site_contents', 'meta_description')) {
                $table->string('meta_description', 512)->nullable()->after('body');
            }
            if (! Schema::hasColumn('site_contents', 'hero_image')) {
                $table->string('hero_image', 2048)->nullable()->after('meta_description');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('site_contents')) {
            return;
        }

        Schema::table('site_contents', function (Blueprint $table) {
            if (Schema::hasColumn('site_contents', 'hero_image')) {
                $table->dropColumn('hero_image');
            }
            if (Schema::hasColumn('site_contents', 'meta_description')) {
                $table->dropColumn('meta_description');
            }
        });
    }
};
