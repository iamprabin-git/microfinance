<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        $now = now();
        DB::table('companies')->insert([
            'name' => 'Default organization',
            'slug' => 'default',
            'is_active' => true,
            'notes' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 32)->default('company_user')->after('password');
            $table->foreignId('company_id')->nullable()->after('role')->constrained()->nullOnDelete();
        });

        Schema::table('groups', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
        });

        DB::table('groups')->whereNull('company_id')->update(['company_id' => 1]);
    }

    public function down(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->dropConstrainedForeignId('company_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('company_id');
            $table->dropColumn('role');
        });

        Schema::dropIfExists('companies');
    }
};
