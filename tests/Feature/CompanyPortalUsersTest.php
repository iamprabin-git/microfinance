<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Company;
use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CompanyPortalUsersTest extends TestCase
{
    use RefreshDatabase;

    private function seedCompanyWithAdmin(): array
    {
        $company = Company::query()->create([
            'name' => 'Test Co-op',
            'slug' => 'test-coop-'.uniqid(),
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyAdmin,
        ]);

        return [$company, $admin];
    }

    public function test_company_admin_can_open_create_staff_form(): void
    {
        [, $admin] = $this->seedCompanyWithAdmin();

        $this->actingAs($admin)
            ->get(route('company.users.create'))
            ->assertOk();
    }

    public function test_company_staff_cannot_open_create_user_form(): void
    {
        [$company] = $this->seedCompanyWithAdmin();

        $staff = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyStaff,
        ]);

        $this->actingAs($staff)
            ->get(route('company.users.create'))
            ->assertForbidden();
    }

    public function test_company_admin_can_open_end_user_invite_form(): void
    {
        [$company, $admin] = $this->seedCompanyWithAdmin();

        $member = Member::query()->create([
            'company_id' => $company->id,
            'name' => 'Pat Lee',
            'email' => 'pat@example.test',
            'phone' => null,
        ]);

        $this->actingAs($admin)
            ->get(route('members.end-user.create', $member))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Members/InviteEndUser')
                ->where('member.id', $member->id)
                ->where('member.name', 'Pat Lee')
                ->where('member.email', 'pat@example.test'));
    }

    public function test_company_admin_cannot_open_end_user_invite_when_member_has_no_email(): void
    {
        [$company, $admin] = $this->seedCompanyWithAdmin();

        $member = Member::query()->create([
            'company_id' => $company->id,
            'name' => 'No Email',
            'email' => null,
            'phone' => null,
        ]);

        $this->actingAs($admin)
            ->get(route('members.end-user.create', $member))
            ->assertForbidden();
    }

    public function test_company_staff_cannot_open_end_user_invite_form(): void
    {
        [$company] = $this->seedCompanyWithAdmin();

        $staff = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyStaff,
        ]);

        $member = Member::query()->create([
            'company_id' => $company->id,
            'name' => 'Pat Lee',
            'email' => 'pat@example.test',
            'phone' => null,
        ]);

        $this->actingAs($staff)
            ->get(route('members.end-user.create', $member))
            ->assertForbidden();
    }

    public function test_company_admin_can_create_end_user_from_member(): void
    {
        [$company, $admin] = $this->seedCompanyWithAdmin();

        $member = Member::query()->create([
            'company_id' => $company->id,
            'name' => 'Pat Lee',
            'email' => 'pat@example.test',
            'phone' => null,
        ]);

        $this->actingAs($admin)
            ->post(route('members.end-user.store', $member), [
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])
            ->assertRedirect(route('members.index'));

        $this->assertDatabaseHas('users', [
            'email' => 'pat@example.test',
            'role' => UserRole::CompanyEndUser->value,
            'company_id' => $company->id,
            'name' => 'Pat Lee',
        ]);
    }
}
