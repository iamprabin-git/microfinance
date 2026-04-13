<?php

namespace App\Filament\Resources\CompanyResource\Pages;

use App\Enums\UserRole;
use App\Filament\Resources\CompanyResource;
use App\Models\User;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateCompany extends CreateRecord
{
    protected static string $resource = CompanyResource::class;

    /** @var array{name?: string, email?: string, password?: string}|null */
    protected ?array $portalAdminBootstrap = null;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $this->portalAdminBootstrap = [
            'name' => $data['portal_admin_name'] ?? null,
            'email' => $data['portal_admin_email'] ?? null,
            'password' => $data['portal_admin_password'] ?? null,
        ];

        unset(
            $data['portal_admin_name'],
            $data['portal_admin_email'],
            $data['portal_admin_password'],
            $data['portal_admin_password_confirmation'],
        );

        if (blank($data['slug'] ?? null)) {
            $data['slug'] = Str::slug($data['name']);
        }

        return $data;
    }

    protected function afterCreate(): void
    {
        $p = $this->portalAdminBootstrap ?? [];
        if (blank($p['email'] ?? null) || blank($p['password'] ?? null) || blank($p['name'] ?? null)) {
            return;
        }

        User::query()->create([
            'name' => $p['name'],
            'email' => $p['email'],
            'password' => Hash::make((string) $p['password']),
            'role' => UserRole::CompanyAdmin,
            'company_id' => $this->record->id,
            'email_verified_at' => now(),
        ]);
    }
}
