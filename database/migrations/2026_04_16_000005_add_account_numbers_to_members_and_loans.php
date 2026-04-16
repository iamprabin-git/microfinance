<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (! Schema::hasColumn('members', 'savings_account_number')) {
                $table->string('savings_account_number', 64)->nullable()->after('member_number');
                $table->unique(['company_id', 'savings_account_number'], 'members_company_savings_account_unique');
            }
        });

        Schema::table('loans', function (Blueprint $table) {
            if (! Schema::hasColumn('loans', 'loan_account_number')) {
                $table->string('loan_account_number', 64)->nullable()->after('id');
                $table->unique(['company_id', 'loan_account_number'], 'loans_company_loan_account_unique');
            }
        });
    }

    public function down(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            if (Schema::hasColumn('loans', 'loan_account_number')) {
                $table->dropUnique('loans_company_loan_account_unique');
                $table->dropColumn('loan_account_number');
            }
        });

        Schema::table('members', function (Blueprint $table) {
            if (Schema::hasColumn('members', 'savings_account_number')) {
                $table->dropUnique('members_company_savings_account_unique');
                $table->dropColumn('savings_account_number');
            }
        });
    }
};

