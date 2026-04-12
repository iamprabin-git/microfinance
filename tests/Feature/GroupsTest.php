<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GroupsTest extends TestCase
{
    use RefreshDatabase;

    public function test_groups_index_requires_company_user(): void
    {
        $company = Company::query()->create([
            'name' => 'Acme',
            'slug' => 'acme-'.uniqid(),
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'company_id' => $company->id,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user)
            ->get(route('groups.index'))
            ->assertOk();
    }
}
