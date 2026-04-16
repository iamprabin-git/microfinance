<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountLookupController extends Controller
{
    public function __invoke(Request $request): Response
    {
        abort_unless($request->user()?->canManageCompanyOperationalData(), 403);

        $companyId = (int) $request->user()->company_id;
        $q = trim((string) $request->query('q', ''));

        $members = [];
        $loans = [];

        if ($q !== '') {
            $numeric = ctype_digit($q) ? (int) $q : null;
            $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q).'%';

            $members = Member::query()
                ->forCompany($companyId)
                ->where(function ($query) use ($q, $like, $numeric): void {
                    $query->where('savings_account_number', $q)
                        ->orWhere('name', 'like', $like)
                        ->orWhere('email', 'like', $like)
                        ->orWhere('phone', 'like', $like);
                    if ($numeric !== null) {
                        $query->orWhere('member_number', $numeric)
                            ->orWhere('id', $numeric);
                    }
                })
                ->orderBy('name')
                ->limit(25)
                ->get(['id', 'member_number', 'savings_account_number', 'name', 'email', 'phone'])
                ->map(fn (Member $m) => [
                    'id' => $m->id,
                    'member_number' => $m->member_number,
                    'savings_account_number' => $m->savings_account_number,
                    'name' => $m->name,
                    'email' => $m->email,
                    'phone' => $m->phone,
                ])
                ->all();

            $loans = Loan::query()
                ->forCompany($companyId)
                ->where(function ($query) use ($q, $like, $numeric): void {
                    $query->where('loan_account_number', $q);
                    if ($numeric !== null) {
                        $query->orWhere('id', $numeric);
                    }
                    $query->orWhereHas('member', fn ($m) => $m->where('name', 'like', $like));
                })
                ->with(['member:id,name'])
                ->orderByDesc('issued_at')
                ->limit(25)
                ->get(['id', 'member_id', 'loan_account_number', 'principal', 'issued_at', 'status'])
                ->map(fn (Loan $l) => [
                    'id' => $l->id,
                    'loan_account_number' => $l->loan_account_number,
                    'principal' => (string) $l->principal,
                    'issued_at' => $l->issued_at?->toDateString(),
                    'status' => $l->status->value,
                    'member' => [
                        'id' => $l->member?->id,
                        'name' => $l->member?->name ?? '—',
                    ],
                ])
                ->all();
        }

        return Inertia::render('AccountLookup/Index', [
            'q' => $q,
            'members' => $members,
            'loans' => $loans,
        ]);
    }
}

