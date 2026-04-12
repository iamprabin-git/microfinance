<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Company;
use App\Models\Group;
use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CoopModulesTest extends TestCase
{
    use RefreshDatabase;

    private function seedCompanyWithGroup(): array
    {
        $company = Company::query()->create([
            'name' => 'Test Co-op',
            'slug' => 'test-coop-'.uniqid(),
            'is_active' => true,
        ]);

        $group = Group::query()->create([
            'company_id' => $company->id,
            'name' => 'Circle A',
            'description' => null,
            'monthly_contribution_amount' => 25,
            'currency' => 'USD',
        ]);

        $admin = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyAdmin,
        ]);

        $reader = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyUser,
        ]);

        return [$company, $group, $admin, $reader];
    }

    public function test_company_user_can_view_members_index(): void
    {
        [, $group, , $reader] = $this->seedCompanyWithGroup();

        Member::query()->create([
            'group_id' => $group->id,
            'name' => 'Alex',
            'email' => null,
            'phone' => null,
        ]);

        $this->actingAs($reader)
            ->get(route('members.index'))
            ->assertOk();
    }

    public function test_company_user_cannot_open_member_create_form(): void
    {
        [, , , $reader] = $this->seedCompanyWithGroup();

        $this->actingAs($reader)
            ->get(route('members.create'))
            ->assertForbidden();
    }

    public function test_company_admin_can_create_member(): void
    {
        [, $group, $admin] = $this->seedCompanyWithGroup();

        $this->actingAs($admin)
            ->post(route('members.store'), [
                'group_id' => $group->id,
                'name' => 'Jamie',
                'email' => 'jamie@example.test',
                'phone' => null,
            ])
            ->assertRedirect(route('members.index'));

        $this->assertDatabaseHas('members', [
            'group_id' => $group->id,
            'name' => 'Jamie',
        ]);
    }
}
