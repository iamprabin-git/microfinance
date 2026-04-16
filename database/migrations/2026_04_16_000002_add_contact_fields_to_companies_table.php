<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            if (! Schema::hasColumn('companies', 'address')) {
                $table->text('address')->nullable()->after('currency');
            }
            if (! Schema::hasColumn('companies', 'contact_phone')) {
                $table->string('contact_phone', 64)->nullable()->after('address');
            }
            if (! Schema::hasColumn('companies', 'contact_email')) {
                $table->string('contact_email', 255)->nullable()->after('contact_phone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $drop = [];
            foreach (['contact_email', 'contact_phone', 'address'] as $col) {
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

