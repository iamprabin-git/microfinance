<?php

namespace App\Http\Controllers;

use App\Enums\LoanStatus;
use App\Models\Group;
use App\Models\Loan;
use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LoanController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Loan::class, 'loan');
    }

    public function index(Request $request): Response
    {
        $companyId = (int) $request->user()->company_id;

        $loans = Loan::query()
            ->forCompany($companyId)
            ->with([
                'group:id,name,currency',
                'member:id,name',
            ])
            ->withSum('repayments', 'amount')
            ->orderByDesc('issued_at')
            ->get()
            ->map(fn (Loan $loan) => [
                'id' => $loan->id,
                'principal' => (string) $loan->principal,
                'issued_at' => $loan->issued_at->format('Y-m-d'),
                'due_date' => $loan->due_date?->format('Y-m-d'),
                'status' => $loan->status->value,
                'repaid' => (string) ($loan->repayments_sum_amount ?? '0'),
                'group' => [
                    'id' => $loan->group->id,
                    'name' => $loan->group->name,
                    'currency' => $loan->group->currency,
                ],
                'member' => [
                    'id' => $loan->member->id,
                    'name' => $loan->member->name,
                ],
            ]);

        return Inertia::render('Loans/Index', [
            'loans' => $loans,
        ]);
    }

    public function create(Request $request): Response
    {
        $companyId = (int) $request->user()->company_id;

        return Inertia::render('Loans/Create', [
            'groups' => $this->groupOptions($companyId),
            'membersByGroup' => $this->membersByGroup($companyId),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = (int) $request->user()->company_id;

        $validated = $request->validate([
            'group_id' => [
                'required',
                'integer',
                Rule::exists('groups', 'id')->where('company_id', $companyId),
            ],
            'member_id' => ['required', 'integer'],
            'principal' => ['required', 'numeric', 'min:0.01'],
            'issued_at' => ['required', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:issued_at'],
            'status' => ['required', Rule::enum(LoanStatus::class)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $member = Member::query()->findOrFail($validated['member_id']);
        if ($member->group_id !== (int) $validated['group_id']) {
            abort(422, 'Member does not belong to the selected group.');
        }

        $validated['due_date'] = filled($validated['due_date'] ?? null)
            ? $validated['due_date']
            : null;

        Loan::query()->create($validated);

        return redirect()->route('loans.index')->with('status', 'Loan created.');
    }

    public function edit(Request $request, Loan $loan): Response
    {
        $companyId = (int) $request->user()->company_id;

        $loan->load(['repayments' => fn ($q) => $q->orderByDesc('paid_at')]);

        return Inertia::render('Loans/Edit', [
            'loan' => [
                'id' => $loan->id,
                'group_id' => $loan->group_id,
                'member_id' => $loan->member_id,
                'principal' => (string) $loan->principal,
                'issued_at' => $loan->issued_at->format('Y-m-d'),
                'due_date' => $loan->due_date?->format('Y-m-d'),
                'status' => $loan->status->value,
                'notes' => $loan->notes,
                'repayments' => $loan->repayments->map(fn ($r) => [
                    'id' => $r->id,
                    'amount' => (string) $r->amount,
                    'paid_at' => $r->paid_at->format('Y-m-d'),
                    'notes' => $r->notes,
                ]),
            ],
            'groups' => $this->groupOptions($companyId),
            'membersByGroup' => $this->membersByGroup($companyId),
            'canRepay' => $request->user()->can('repay', $loan),
        ]);
    }

    public function update(Request $request, Loan $loan): RedirectResponse
    {
        $companyId = (int) $request->user()->company_id;

        $validated = $request->validate([
            'group_id' => [
                'required',
                'integer',
                Rule::exists('groups', 'id')->where('company_id', $companyId),
            ],
            'member_id' => ['required', 'integer'],
            'principal' => ['required', 'numeric', 'min:0.01'],
            'issued_at' => ['required', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:issued_at'],
            'status' => ['required', Rule::enum(LoanStatus::class)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $member = Member::query()->findOrFail($validated['member_id']);
        if ($member->group_id !== (int) $validated['group_id']) {
            abort(422, 'Member does not belong to the selected group.');
        }

        $validated['due_date'] = filled($validated['due_date'] ?? null)
            ? $validated['due_date']
            : null;

        $loan->update($validated);

        return redirect()->route('loans.index')->with('status', 'Loan updated.');
    }

    public function destroy(Loan $loan): RedirectResponse
    {
        $loan->delete();

        return redirect()->route('loans.index')->with('status', 'Loan removed.');
    }

    /**
     * @return list<array{id: int, name: string, currency: string}>
     */
    private function groupOptions(int $companyId): array
    {
        return Group::query()
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get()
            ->map(fn (Group $g) => [
                'id' => $g->id,
                'name' => $g->name,
                'currency' => $g->currency,
            ])
            ->all();
    }

    /**
     * @return array<string, list<array{id: int, name: string}>>
     */
    private function membersByGroup(int $companyId): array
    {
        $members = Member::query()
            ->forCompany($companyId)
            ->orderBy('name')
            ->get(['id', 'group_id', 'name']);

        $out = [];
        foreach ($members as $m) {
            $key = (string) $m->group_id;
            $out[$key] ??= [];
            $out[$key][] = ['id' => $m->id, 'name' => $m->name];
        }

        return $out;
    }
}
