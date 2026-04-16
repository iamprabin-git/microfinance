<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_voucher_lines', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('journal_voucher_id')->constrained('journal_vouchers')->cascadeOnDelete();
            $table->string('side'); // debit | credit
            $table->foreignId('chart_of_account_id')->constrained('chart_of_accounts')->cascadeOnDelete();
            $table->decimal('amount', 14, 2);
            $table->timestamps();

            $table->index(['journal_voucher_id', 'side']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_voucher_lines');
    }
};
