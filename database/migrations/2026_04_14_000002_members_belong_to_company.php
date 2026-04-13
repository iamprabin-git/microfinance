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
            $table->unsignedBigInteger('company_id')->nullable()->after('id');
        });

        foreach (DB::table('members')->select('id', 'group_id')->cursor() as $row) {
            $companyId = DB::table('groups')->where('id', $row->group_id)->value('company_id');
            DB::table('members')->where('id', $row->id)->update(['company_id' => $companyId]);
        }

        Schema::table('members', function (Blueprint $table) {
            $table->dropForeign(['group_id']);
        });

        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn('group_id');
        });

        Schema::table('members', function (Blueprint $table) {
            $table->foreign('company_id')
                ->references('id')
                ->on('companies')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        throw new RuntimeException('members_belong_to_company cannot be reversed.');
    }
};
