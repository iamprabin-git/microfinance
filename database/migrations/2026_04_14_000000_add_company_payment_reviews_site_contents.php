<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('companies') && ! Schema::hasColumn('companies', 'payment_status')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->string('payment_status', 32)->default('pending')->after('is_active');
                $table->text('payment_receipt_notes')->nullable()->after('payment_status');
                $table->timestamp('payment_reviewed_at')->nullable()->after('payment_receipt_notes');
            });
        }

        if (! Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->unsignedTinyInteger('rating');
                $table->string('title')->nullable();
                $table->text('body');
                $table->boolean('is_approved')->default(false);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('site_contents')) {
            Schema::create('site_contents', function (Blueprint $table) {
                $table->id();
                $table->string('slug', 64)->unique();
                $table->string('title');
                $table->string('subtitle')->nullable();
                $table->longText('body')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('site_contents');
        Schema::dropIfExists('reviews');

        if (Schema::hasTable('companies') && Schema::hasColumn('companies', 'payment_status')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->dropColumn([
                    'payment_status',
                    'payment_receipt_notes',
                    'payment_reviewed_at',
                ]);
            });
        }
    }
};
