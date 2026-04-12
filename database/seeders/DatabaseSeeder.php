<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@samuh.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => UserRole::SuperAdmin,
                'company_id' => null,
            ]
        );

        $acme = Company::query()->firstOrCreate(
            ['slug' => 'acme'],
            [
                'name' => 'Acme Cooperative',
                'is_active' => true,
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'owner@acme.test'],
            [
                'name' => 'Acme Owner',
                'password' => Hash::make('password'),
                'role' => UserRole::CompanyAdmin,
                'company_id' => $acme->id,
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'staff@acme.test'],
            [
                'name' => 'Acme Staff',
                'password' => Hash::make('password'),
                'role' => UserRole::CompanyUser,
                'company_id' => $acme->id,
            ]
        );
    }
}
