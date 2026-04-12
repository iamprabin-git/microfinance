<?php

namespace Database\Seeders;

use App\Enums\CompanyPaymentStatus;
use App\Enums\UserRole;
use App\Models\Company;
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
            ]
        );

        $acme->update([
            'is_active' => true,
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
    }
}
