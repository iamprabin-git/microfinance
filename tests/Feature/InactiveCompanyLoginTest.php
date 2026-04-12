<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class InactiveCompanyLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_user_cannot_login_when_company_is_inactive(): void
    {
        $company = Company::query()->create([
            'name' => 'Frozen Co',
            'slug' => 'frozen-'.uniqid(),
            'is_active' => false,
        ]);

        $user = User::factory()->create([
            'email' => 'member@frozen.test',
            'password' => Hash::make('password'),
            'company_id' => $company->id,
            'email_verified_at' => now(),
        ]);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertGuest();
    }
}
