<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case CompanyAdmin = 'company_admin';
    case CompanyUser = 'company_user';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super admin',
            self::CompanyAdmin => 'Company admin',
            self::CompanyUser => 'Company user',
        };
    }

    public static function forCompanyForm(): array
    {
        return [
            self::CompanyAdmin->value => self::CompanyAdmin->label(),
            self::CompanyUser->value => self::CompanyUser->label(),
        ];
    }
}
