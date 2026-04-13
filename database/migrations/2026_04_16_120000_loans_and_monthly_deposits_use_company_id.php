<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('companies', 'currency')) {
            Schema::table('companies', function (Blueprint $table): void {
                $table->string('currency', 8)->default('NPR')->after('slug');
            });
        }

        foreach (DB::table('companies')->pluck('id') as $companyId) {
            $currency = DB::table('groups')
                ->where('company_id', $companyId)
                ->orderBy('name')
                ->value('currency');
            DB::table('companies')
                ->where('id', $companyId)
                ->update(['currency' => $currency ?? 'NPR']);
        }

        if (! Schema::hasColumn('loans', 'company_id')) {
            Schema::table('loans', function (Blueprint $table): void {
                $table->unsignedBigInteger('company_id')->nullable()->after('id');
            });
        }

        if (Schema::hasColumn('loans', 'group_id')) {
            foreach (DB::table('loans')->select('id', 'group_id')->cursor() as $row) {
                if (! $row->group_id) {
                    continue;
                }
                $companyId = DB::table('groups')->where('id', $row->group_id)->value('company_id');
                if ($companyId) {
                    DB::table('loans')->where('id', $row->id)->update(['company_id' => $companyId]);
                }
            }
        }

        $fallbackCompanyId = DB::table('companies')->orderBy('id')->value('id');
        if ($fallbackCompanyId) {
            DB::table('loans')->whereNull('company_id')->update(['company_id' => $fallbackCompanyId]);
        }

        if (Schema::hasColumn('loans', 'group_id')) {
            Schema::table('loans', function (Blueprint $table): void {
                $table->dropForeign(['group_id']);
                $table->dropColumn('group_id');
            });
        }

        if (Schema::hasColumn('loans', 'company_id')) {
            try {
                Schema::table('loans', function (Blueprint $table): void {
                    $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
                });
            } catch (Throwable) {
                // Foreign key may already exist when re-running migrations.
            }
        }

        if (! Schema::hasColumn('monthly_deposits', 'company_id')) {
            Schema::table('monthly_deposits', function (Blueprint $table): void {
                $table->unsignedBigInteger('company_id')->nullable()->after('id');
            });
        }

        if (Schema::hasColumn('monthly_deposits', 'group_id')) {
            foreach (DB::table('monthly_deposits')->select('id', 'group_id')->cursor() as $row) {
                if (! $row->group_id) {
                    continue;
                }
                $companyId = DB::table('groups')->where('id', $row->group_id)->value('company_id');
                if ($companyId) {
                    DB::table('monthly_deposits')->where('id', $row->id)->update(['company_id' => $companyId]);
                }
            }
        }

        if ($fallbackCompanyId) {
            DB::table('monthly_deposits')->whereNull('company_id')->update(['company_id' => $fallbackCompanyId]);
        }

        if (Schema::hasColumn('monthly_deposits', 'group_id')) {
            Schema::table('monthly_deposits', function (Blueprint $table): void {
                $table->dropForeign(['group_id']);
                $table->dropColumn('group_id');
            });
        }

        if (Schema::hasColumn('monthly_deposits', 'company_id')) {
            try {
                Schema::table('monthly_deposits', function (Blueprint $table): void {
                    $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete();
                });
            } catch (Throwable) {
                //
            }
        }
    }

    public function down(): void
    {
        //
    }
};
