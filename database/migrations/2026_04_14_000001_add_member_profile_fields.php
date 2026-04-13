<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->text('address')->nullable()->after('phone');
            $table->string('profile_photo_path')->nullable()->after('address');
            $table->string('member_uid', 26)->nullable()->after('id');
        });

        foreach (DB::table('members')->select('id', 'member_uid')->cursor() as $row) {
            if ($row->member_uid !== null && $row->member_uid !== '') {
                continue;
            }
            DB::table('members')->where('id', $row->id)->update([
                'member_uid' => (string) Str::ulid(),
            ]);
        }

        Schema::table('members', function (Blueprint $table) {
            $table->unique('member_uid');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropUnique(['member_uid']);
            $table->dropColumn(['address', 'profile_photo_path', 'member_uid']);
        });
    }
};
