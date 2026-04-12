<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_deposits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->date('period'); // first day of calendar month
            $table->decimal('amount', 14, 2);
            $table->string('status', 32)->default('pending'); // pending | paid
            $table->date('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['member_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_deposits');
    }
};
