<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $vouchers = DB::table('journal_vouchers')->select([
            'id',
            'dr_chart_of_account_id',
            'cr_chart_of_account_id',
            'dr_amount',
            'cr_amount',
        ])->get();

        foreach ($vouchers as $v) {
            $drId = $v->dr_chart_of_account_id ? (int) $v->dr_chart_of_account_id : null;
            $crId = $v->cr_chart_of_account_id ? (int) $v->cr_chart_of_account_id : null;
            $dr = (float) $v->dr_amount;
            $cr = (float) $v->cr_amount;

            if ($drId !== null && $dr > 0.000001) {
                DB::table('journal_voucher_lines')->insert([
                    'journal_voucher_id' => (int) $v->id,
                    'side' => 'debit',
                    'chart_of_account_id' => $drId,
                    'amount' => $dr,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            if ($crId !== null && $cr > 0.000001) {
                DB::table('journal_voucher_lines')->insert([
                    'journal_voucher_id' => (int) $v->id,
                    'side' => 'credit',
                    'chart_of_account_id' => $crId,
                    'amount' => $cr,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        DB::table('journal_voucher_lines')->truncate();
    }
};
