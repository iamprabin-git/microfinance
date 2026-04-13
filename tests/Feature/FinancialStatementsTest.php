<?php

namespace Tests\Feature;

use App\Enums\CompanyApprovalStatus;
use App\Enums\DepositStatus;
use App\Enums\LoanStatus;
use App\Enums\UserRole;
use App\Models\Company;
use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Models\Member;
use App\Models\MonthlyDeposit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FinancialStatementsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: Company, 1: Member, 2: User}
     */
    private function seedCompanyAdminLoanFixture(): array
    {
        $company = Company::query()->create([
            'name' => 'Stmt Co-op',
            'slug' => 'stmt-'.uniqid(),
            'is_active' => true,
            'currency' => 'NPR',
        ]);

        $member = Member::query()->create([
            'company_id' => $company->id,
            'name' => 'Riley',
            'email' => 'riley@example.test',
            'phone' => null,
        ]);

        $admin = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyAdmin,
        ]);

        $loan = Loan::query()->create([
            'company_id' => $company->id,
            'member_id' => $member->id,
            'principal' => '1000.00',
            'issued_at' => '2026-01-05',
            'due_date' => null,
            'status' => LoanStatus::Active,
            'company_approval_status' => CompanyApprovalStatus::Approved,
        ]);

        LoanRepayment::query()->create([
            'loan_id' => $loan->id,
            'amount' => '200.00',
            'paid_at' => '2026-01-10',
            'notes' => null,
        ]);

        MonthlyDeposit::query()->create([
            'company_id' => $company->id,
            'member_id' => $member->id,
            'period' => '2026-01-01',
            'amount' => '50.00',
            'status' => DepositStatus::Paid,
            'paid_at' => '2026-01-08',
            'company_approval_status' => CompanyApprovalStatus::Approved,
        ]);

        $memberPendingOnly = Member::query()->create([
            'company_id' => $company->id,
            'name' => 'Jordan',
            'email' => 'jordan@example.test',
            'phone' => null,
        ]);

        MonthlyDeposit::query()->create([
            'company_id' => $company->id,
            'member_id' => $memberPendingOnly->id,
            'period' => '2026-01-01',
            'amount' => '25.00',
            'status' => DepositStatus::Pending,
            'paid_at' => null,
            'company_approval_status' => CompanyApprovalStatus::Approved,
        ]);

        return [$company, $member, $admin];
    }

    public function test_company_admin_can_view_trial_balance(): void
    {
        [, , $admin] = $this->seedCompanyAdminLoanFixture();

        $this->actingAs($admin)
            ->get(route('financial-statements.index', [
                'report' => 'trial-balance',
                'as_of' => '2026-01-31',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('FinancialStatements/Index')
                ->where('report', 'trial-balance')
                ->where('trial_balance.total_debit', '800.00')
                ->where('trial_balance.total_credit', '800.00')
                ->where('trial_balance.rows.0.debit', '800.00'));
    }

    public function test_company_staff_can_view_balance_sheet(): void
    {
        [$company] = $this->seedCompanyAdminLoanFixture();

        $staff = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyStaff,
        ]);

        $this->actingAs($staff)
            ->get(route('financial-statements.index', [
                'report' => 'balance-sheet',
                'as_of' => '2026-01-31',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('FinancialStatements/Index')
                ->has('balance_sheet.assets'));
    }

    public function test_end_user_sees_only_own_member_activity(): void
    {
        [$company] = $this->seedCompanyAdminLoanFixture();

        Member::query()->create([
            'company_id' => $company->id,
            'name' => 'Other',
            'email' => 'other@example.test',
            'phone' => null,
        ]);

        $endUser = User::factory()->create([
            'email' => 'other@example.test',
            'company_id' => $company->id,
            'role' => UserRole::CompanyEndUser,
        ]);

        $this->actingAs($endUser)
            ->get(route('financial-statements.index', [
                'report' => 'trial-balance',
                'as_of' => '2026-01-31',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('FinancialStatements/Index')
                ->where('trial_balance.rows.0.debit', '0.00'));
    }

    public function test_company_user_can_open_profit_and_loss(): void
    {
        [$company] = $this->seedCompanyAdminLoanFixture();

        $reader = User::factory()->create([
            'company_id' => $company->id,
            'role' => UserRole::CompanyUser,
        ]);

        $this->actingAs($reader)
            ->get(route('financial-statements.index', [
                'report' => 'profit-and-loss',
                'from' => '2026-01-01',
                'to' => '2026-01-31',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('FinancialStatements/Index')
                ->has('profit_and_loss.lines'));
    }

    public function test_cash_flow_includes_opening_and_closing(): void
    {
        [, , $admin] = $this->seedCompanyAdminLoanFixture();

        $this->actingAs($admin)
            ->get(route('financial-statements.index', [
                'report' => 'cash-flow',
                'from' => '2026-01-01',
                'to' => '2026-01-31',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('FinancialStatements/Index')
                ->has('cash_flow.opening')
                ->has('cash_flow.closing'));
    }

    public function test_savings_register_lists_individual_deposits_in_period(): void
    {
        [$company, , $admin] = $this->seedCompanyAdminLoanFixture();

        $this->assertSame(
            2,
            MonthlyDeposit::query()->where('company_id', $company->id)->count(),
        );

        $this->actingAs($admin)
            ->get(route('financial-statements.index', [
                'report' => 'savings-register',
                'from' => '2026-01-01',
                'to' => '2026-01-31',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('FinancialStatements/Index')
                ->where('report', 'savings-register')
                ->has('savings_register.rows', 2)
                ->where('savings_register.rows.0.amount', '50.00')
                ->where('savings_register.rows.1.amount', '25.00')
                ->where('savings_register.total', '50.00'));
    }

    public function test_loans_register_lists_individual_loans_with_outstanding(): void
    {
        [, , $admin] = $this->seedCompanyAdminLoanFixture();

        $this->actingAs($admin)
            ->get(route('financial-statements.index', [
                'report' => 'loans-register',
                'from' => '2026-01-01',
                'to' => '2026-01-31',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('FinancialStatements/Index')
                ->where('report', 'loans-register')
                ->has('loans_register.rows', 1)
                ->where('loans_register.rows.0.principal', '1000.00')
                ->where('loans_register.rows.0.repaid_cumulative', '200.00')
                ->where('loans_register.rows.0.repaid_in_period', '200.00')
                ->where('loans_register.rows.0.outstanding', '800.00'));
    }
}
