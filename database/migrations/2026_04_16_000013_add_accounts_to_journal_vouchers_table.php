<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('journal_vouchers', function (Blueprint $table): void {
            $table->foreignId('dr_chart_of_account_id')
                ->nullable()
                ->after('description')
                ->constrained('chart_of_accounts')
                ->nullOnDelete();

            $table->foreignId('cr_chart_of_account_id')
                ->nullable()
                ->after('dr_chart_of_account_id')
                ->constrained('chart_of_accounts')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('journal_vouchers', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('dr_chart_of_account_id');
            $table->dropConstrainedForeignId('cr_chart_of_account_id');
        });
    }
};

