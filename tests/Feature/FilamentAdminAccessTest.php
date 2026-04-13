<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FilamentAdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_visiting_admin_is_redirected_to_filament_login(): void
    {
        $this->get('/admin')
            ->assertRedirect(route('filament.admin.auth.login'));
    }

    public function test_company_user_visiting_admin_is_redirected_to_company_dashboard(): void
    {
        $company = Company::query()->create([
            'name' => 'Co-op',
            'slug' => 'coop-'.uniqid(),
            'is_active' => true,
            'currency' => 'NPR',
        ]);

        $user = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyUser,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)
            ->get('/admin')
            ->assertRedirect(route('dashboard'));
    }
}
