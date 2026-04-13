<?php

namespace Database\Seeders;

use App\Enums\CompanyPaymentStatus;
use App\Enums\DepositStatus;
use App\Enums\LoanStatus;
use App\Enums\UserRole;
use App\Models\Company;
use App\Models\Loan;
use App\Models\Member;
use App\Models\MonthlyDeposit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(SiteContentSeeder::class);

        User::query()->updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => UserRole::SuperAdmin,
                'company_id' => null,
                'email_verified_at' => Carbon::now(),
            ]
        );

        $acme = Company::query()->firstOrCreate(
            ['slug' => 'acme'],
            [
                'name' => 'Acme Cooperative',
                'is_active' => true,
                'currency' => config('app.default_currency'),
            ]
        );

        $acme->update([
            'is_active' => true,
            'currency' => $acme->currency ?? config('app.default_currency'),
            'payment_status' => CompanyPaymentStatus::Approved,
            'payment_reviewed_at' => Carbon::now(),
            'payment_receipt_notes' => $acme->payment_receipt_notes ?? 'Demo seed: payment verified.',
        ]);

        User::query()->updateOrCreate(
            ['email' => 'company@gmail.com'],
            [
                'name' => 'Company Admin',
                'password' => Hash::make('password'),
                'role' => UserRole::CompanyAdmin,
                'company_id' => $acme->id,
                'email_verified_at' => Carbon::now(),
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'user@gmail.com'],
            [
                'name' => 'Company User',
                'password' => Hash::make('password'),
                'role' => UserRole::CompanyUser,
                'company_id' => $acme->id,
                'email_verified_at' => Carbon::now(),
            ]
        );

        $demoMember = Member::query()->firstOrCreate(
            [
                'company_id' => $acme->id,
                'email' => 'member.demo@example.com',
            ],
            [
                'name' => 'Demo Member',
                'phone' => null,
            ]
        );

        MonthlyDeposit::query()->firstOrCreate(
            [
                'member_id' => $demoMember->id,
                'period' => Carbon::now()->startOfMonth()->toDateString(),
            ],
            [
                'company_id' => $acme->id,
                'amount' => 50,
                'status' => DepositStatus::Paid,
                'paid_at' => Carbon::now()->toDateString(),
            ]
        );

        Loan::query()->firstOrCreate(
            [
                'company_id' => $acme->id,
                'member_id' => $demoMember->id,
                'principal' => 200,
                'issued_at' => Carbon::now()->subMonth()->startOfMonth()->toDateString(),
            ],
            [
                'due_date' => Carbon::now()->addMonths(2)->toDateString(),
                'status' => LoanStatus::Active,
                'notes' => 'Demo seed loan — record repayments from the portal.',
            ]
        );
    }
}
