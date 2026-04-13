<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Company;
use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
            'currency' => 'NPR',
        ]);

        $admin = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyAdmin,
        ]);

        $reader = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyUser,
        ]);

        return [$company, $admin, $reader];
    }

    public function test_company_user_can_view_members_index(): void
    {
        [$company, , $reader] = $this->seedCompanyWithGroup();

        Member::query()->create([
            'company_id' => $company->id,
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
        [, , $reader] = $this->seedCompanyWithGroup();

        $this->actingAs($reader)
            ->get(route('members.create'))
            ->assertForbidden();
    }

    public function test_company_admin_can_create_member(): void
    {
        Storage::fake('public');

        [$company, $admin] = $this->seedCompanyWithGroup();

        $photo = UploadedFile::fake()->image('member.jpg', 120, 120);

        $this->actingAs($admin)
            ->post(route('members.store'), [
                'name' => 'Jamie',
                'email' => 'jamie@example.test',
                'phone' => null,
                'address' => '1 Demo Lane',
                'profile_image' => $photo,
            ])
            ->assertRedirect(route('members.index'));

        $this->assertDatabaseHas('members', [
            'company_id' => $company->id,
            'name' => 'Jamie',
            'address' => '1 Demo Lane',
        ]);

        $member = Member::query()->where('name', 'Jamie')->firstOrFail();
        $this->assertSame(1, $member->member_number);
        $this->assertNotNull($member->profile_photo_path);
        Storage::disk('public')->assertExists($member->profile_photo_path);
    }
}
