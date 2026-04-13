<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case CompanyAdmin = 'company_admin';
    case CompanyUser = 'company_user';
    case CompanyStaff = 'company_staff';
    case CompanyEndUser = 'company_end_user';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Admin',
            self::CompanyAdmin => 'Company',
            self::CompanyUser => 'Reader',
            self::CompanyStaff => 'Staff',
            self::CompanyEndUser => 'End user',
        };
    }

    /**
     * Roles a company account may assign in the portal (not platform admin).
     *
     * @return array<string, string>
     */
    public static function forCompanyForm(): array
    {
        return [
            self::CompanyStaff->value => self::CompanyStaff->label(),
            self::CompanyEndUser->value => self::CompanyEndUser->label(),
        ];
    }
}
