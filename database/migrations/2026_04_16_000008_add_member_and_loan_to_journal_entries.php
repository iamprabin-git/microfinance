<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            if (! Schema::hasColumn('journal_entries', 'member_id')) {
                $table->foreignId('member_id')->nullable()->after('company_id')
                    ->constrained('members')
                    ->nullOnDelete();
                $table->index(['company_id', 'member_id']);
            }
            if (! Schema::hasColumn('journal_entries', 'loan_id')) {
                $table->foreignId('loan_id')->nullable()->after('member_id')
                    ->constrained('loans')
                    ->nullOnDelete();
                $table->index(['company_id', 'loan_id']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            if (Schema::hasColumn('journal_entries', 'loan_id')) {
                $table->dropConstrainedForeignId('loan_id');
            }
            if (Schema::hasColumn('journal_entries', 'member_id')) {
                $table->dropConstrainedForeignId('member_id');
            }
        });
    }
};

