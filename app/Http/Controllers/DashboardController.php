<?php

namespace App\Http\Controllers;

use App\Enums\CompanyApprovalStatus;
use App\Models\Loan;
use App\Models\MonthlyDeposit;
use App\Models\User;
use App\Services\FinancialReporting\FinancialReportsBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $companyId = (int) $request->user()->company_id;

        $users = User::query()
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
            ]);

        $pendingLoans = 0;
        $pendingSavings = 0;
        if (
            $request->user()->isCompanyAdmin()
            && Schema::hasColumn('loans', 'company_approval_status')
            && Schema::hasColumn('monthly_deposits', 'company_approval_status')
        ) {
            $pendingLoans = Loan::query()
                ->forCompany($companyId)
                ->where('company_approval_status', CompanyApprovalStatus::PendingApproval->value)
                ->count();
            $pendingSavings = MonthlyDeposit::query()
                ->forCompany($companyId)
                ->where('company_approval_status', CompanyApprovalStatus::PendingApproval->value)
                ->count();
        }

        $financialDashboard = null;
        if (
            $request->user()->belongsToCompanyWebPortal()
            && ! $request->user()->isCompanyEndUser()
        ) {
            $financialDashboard = FinancialReportsBuilder::forUser($request->user())
                ->dashboardAnalytics();
        }

        return Inertia::render('Dashboard', [
            'companyUsers' => $users,
            'pendingApprovals' => [
                'loans' => $pendingLoans,
                'savings' => $pendingSavings,
            ],
            'financialDashboard' => $financialDashboard,
        ]);
    }
}
