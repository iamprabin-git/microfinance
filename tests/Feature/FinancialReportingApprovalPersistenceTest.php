<?php

namespace Tests\Feature;

use App\Enums\CompanyApprovalStatus;
use App\Enums\DepositStatus;
use App\Enums\LoanStatus;
use App\Enums\UserRole;
use App\Models\Company;
use App\Models\Loan;
use App\Models\Member;
use App\Models\MonthlyDeposit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FinancialReportingApprovalPersistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_non_material_saving_edit_keeps_approval_so_statements_show_row(): void
    {
        $company = Company::query()->create([
            'name' => 'Co-op FS',
            'slug' => 'coop-fs-'.uniqid(),
            'is_active' => true,
            'currency' => 'NPR',
        ]);
        $member = Member::query()->create([
            'company_id' => $company->id,
            'name' => 'Alex',
            'email' => 'alex@example.test',
            'phone' => null,
        ]);
        $saving = MonthlyDeposit::query()->create([
            'company_id' => $company->id,
            'member_id' => $member->id,
            'period' => '2026-03-01',
            'amount' => '75.00',
            'status' => DepositStatus::Paid,
            'paid_at' => '2026-03-15',
            'company_approval_status' => CompanyApprovalStatus::Approved,
        ]);
        $staff = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyStaff,
        ]);

        $this->actingAs($staff)
            ->patch(route('savings.update', $saving), [
                'member_id' => $member->id,
                'period' => '2026-03-01',
                'amount' => '75.00',
                'status' => DepositStatus::Paid->value,
                'paid_at' => '2026-03-15',
            ])
            ->assertRedirect(route('savings.index'));

        $saving->refresh();
        $this->assertSame(CompanyApprovalStatus::Approved, $saving->company_approval_status);

        $reader = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyUser,
        ]);

        $this->actingAs($reader)
            ->get(route('financial-statements.index', [
                'report' => 'savings-register',
                'from' => '2026-03-01',
                'to' => '2026-03-31',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('savings_register.total', '75.00'));
    }

    public function test_staff_material_saving_edit_resets_approval_and_excludes_from_statements(): void
    {
        $company = Company::query()->create([
            'name' => 'Co-op FS2',
            'slug' => 'coop-fs2-'.uniqid(),
            'is_active' => true,
            'currency' => 'NPR',
        ]);
        $member = Member::query()->create([
            'company_id' => $company->id,
            'name' => 'Blake',
            'email' => 'blake@example.test',
            'phone' => null,
        ]);
        $saving = MonthlyDeposit::query()->create([
            'company_id' => $company->id,
            'member_id' => $member->id,
            'period' => '2026-04-01',
            'amount' => '75.00',
            'status' => DepositStatus::Paid,
            'paid_at' => '2026-04-10',
            'company_approval_status' => CompanyApprovalStatus::Approved,
        ]);
        $staff = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyStaff,
        ]);

        $this->actingAs($staff)
            ->patch(route('savings.update', $saving), [
                'member_id' => $member->id,
                'period' => '2026-04-01',
                'amount' => '99.00',
                'status' => DepositStatus::Paid->value,
                'paid_at' => '2026-04-10',
            ])
            ->assertRedirect(route('savings.index'));

        $saving->refresh();
        $this->assertSame(CompanyApprovalStatus::PendingApproval, $saving->company_approval_status);

        $reader = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyUser,
        ]);

        $this->actingAs($reader)
            ->get(route('financial-statements.index', [
                'report' => 'savings-register',
                'from' => '2026-04-01',
                'to' => '2026-04-30',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('savings_register.total', '0.00'));
    }

    public function test_staff_non_material_loan_edit_keeps_approval(): void
    {
        $company = Company::query()->create([
            'name' => 'Co-op Loan',
            'slug' => 'coop-loan-'.uniqid(),
            'is_active' => true,
            'currency' => 'NPR',
        ]);
        $member = Member::query()->create([
            'company_id' => $company->id,
            'name' => 'Casey',
            'email' => 'casey@example.test',
            'phone' => null,
        ]);
        $loan = Loan::query()->create([
            'company_id' => $company->id,
            'member_id' => $member->id,
            'principal' => '500.00',
            'issued_at' => '2026-02-01',
            'due_date' => null,
            'status' => LoanStatus::Active,
            'notes' => null,
            'company_approval_status' => CompanyApprovalStatus::Approved,
        ]);
        $staff = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyStaff,
        ]);

        $this->actingAs($staff)
            ->patch(route('loans.update', $loan), [
                'member_id' => $member->id,
                'principal' => '500.00',
                'issued_at' => '2026-02-01',
                'due_date' => null,
                'status' => LoanStatus::Active->value,
                'notes' => 'Memo line only',
            ])
            ->assertRedirect(route('loans.index'));

        $loan->refresh();
        $this->assertSame(CompanyApprovalStatus::Approved, $loan->company_approval_status);
    }
}
