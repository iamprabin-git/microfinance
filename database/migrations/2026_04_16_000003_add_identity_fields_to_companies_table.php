<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            if (! Schema::hasColumn('companies', 'pan_vat_number')) {
                $table->string('pan_vat_number', 64)->nullable()->after('contact_email');
            }
            if (! Schema::hasColumn('companies', 'registration_number')) {
                $table->string('registration_number', 64)->nullable()->after('pan_vat_number');
            }
            if (! Schema::hasColumn('companies', 'website')) {
                $table->string('website', 255)->nullable()->after('registration_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $drop = [];
            foreach (['website', 'registration_number', 'pan_vat_number'] as $col) {
                if (Schema::hasColumn('companies', $col)) {
                    $drop[] = $col;
                }
            }
            if ($drop !== []) {
                $table->dropColumn($drop);
            }
        });
    }
};

