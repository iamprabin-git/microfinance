<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_lists_company_users(): void
    {
        $company = Company::query()->create([
            'name' => 'Acme',
            'slug' => 'acme-'.uniqid(),
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.test',
            'company_id' => $company->id,
            'email_verified_at' => now(),
        ]);

        User::factory()->create([
            'name' => 'Staff User',
            'email' => 'staff@example.test',
            'company_id' => $company->id,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->has('companyUsers', 2)
                ->where('companyUsers.0.name', fn ($name) => in_array($name, ['Admin User', 'Staff User'], true))
            );
    }
}
