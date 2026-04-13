<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('loans', 'company_approval_status')) {
            Schema::table('loans', function (Blueprint $table) {
                $table->string('company_approval_status', 32)
                    ->default('approved')
                    ->after('status');
            });
        }

        if (! Schema::hasColumn('monthly_deposits', 'company_approval_status')) {
            Schema::table('monthly_deposits', function (Blueprint $table) {
                $table->string('company_approval_status', 32)
                    ->default('approved')
                    ->after('status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('loans', 'company_approval_status')) {
            Schema::table('loans', function (Blueprint $table) {
                $table->dropColumn('company_approval_status');
            });
        }

        if (Schema::hasColumn('monthly_deposits', 'company_approval_status')) {
            Schema::table('monthly_deposits', function (Blueprint $table) {
                $table->dropColumn('company_approval_status');
            });
        }
    }
};
