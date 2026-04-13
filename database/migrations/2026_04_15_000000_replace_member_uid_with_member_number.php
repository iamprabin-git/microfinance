<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->unsignedInteger('member_number')->nullable()->after('company_id');
        });

        $companyIds = DB::table('members')->distinct()->pluck('company_id');
        foreach ($companyIds as $companyId) {
            $ids = DB::table('members')
                ->where('company_id', $companyId)
                ->orderBy('id')
                ->pluck('id');
            $n = 1;
            foreach ($ids as $id) {
                DB::table('members')->where('id', $id)->update(['member_number' => $n]);
                $n++;
            }
        }

        Schema::table('members', function (Blueprint $table) {
            $table->dropUnique(['member_uid']);
        });

        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn('member_uid');
        });

        Schema::table('members', function (Blueprint $table) {
            $table->unique(['company_id', 'member_number']);
        });
    }

    public function down(): void
    {
        throw new RuntimeException('replace_member_uid_with_member_number cannot be reversed.');
    }
};
