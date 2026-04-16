<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('savings_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->string('type', 16); // deposit | withdraw
            $table->decimal('amount', 14, 2);
            $table->date('occurred_at');
            $table->string('status', 32)->default('paid'); // paid | pending
            $table->string('company_approval_status', 32)->default('pending_approval');
            $table->string('reference', 128)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'member_id', 'occurred_at']);
            $table->index(['company_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('savings_transactions');
    }
};

