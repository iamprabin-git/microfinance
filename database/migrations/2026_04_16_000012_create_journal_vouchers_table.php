<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_vouchers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->date('voucher_date');
            $table->string('voucher_number')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('dr_amount', 14, 2)->default(0);
            $table->decimal('cr_amount', 14, 2)->default(0);
            $table->string('remarks', 255)->nullable();
            $table->timestamps();

            $table->index(['company_id', 'voucher_date']);
            $table->unique(['company_id', 'voucher_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_vouchers');
    }
};

