<?php

namespace App\Http\Controllers;

use App\Enums\DepositStatus;
use App\Models\Group;
use App\Models\Member;
use App\Models\MonthlyDeposit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MonthlyDepositController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(MonthlyDeposit::class, 'saving');
    }

    public function index(Request $request): Response
    {
        $companyId = (int) $request->user()->company_id;

        $savings = MonthlyDeposit::query()
            ->forCompany($companyId)
            ->with([
                'group:id,name,currency',
                'member:id,name',
            ])
            ->orderByDesc('period')
            ->orderBy('member_id')
            ->get()
            ->map(fn (MonthlyDeposit $row) => [
                'id' => $row->id,
                'period' => $row->period->format('Y-m-d'),
                'amount' => (string) $row->amount,
                'status' => $row->status->value,
                'paid_at' => $row->paid_at?->format('Y-m-d'),
                'group' => [
                    'id' => $row->group->id,
                    'name' => $row->group->name,
                    'currency' => $row->group->currency,
                ],
                'member' => [
                    'id' => $row->member->id,
                    'name' => $row->member->name,
                ],
            ]);

        return Inertia::render('Savings/Index', [
            'savings' => $savings,
        ]);
    }

    public function create(Request $request): Response
    {
        $companyId = (int) $request->user()->company_id;

        return Inertia::render('Savings/Create', [
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
            'period' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'status' => ['required', Rule::enum(DepositStatus::class)],
            'paid_at' => ['nullable', 'date', 'required_if:status,'.DepositStatus::Paid->value],
        ]);

        $member = Member::query()->findOrFail($validated['member_id']);
        if ($member->group_id !== (int) $validated['group_id']) {
            abort(422, 'Member does not belong to the selected group.');
        }

        $periodStart = Carbon::parse($validated['period'])->startOfMonth()->toDateString();

        $dup = MonthlyDeposit::query()
            ->where('member_id', $validated['member_id'])
            ->where('period', $periodStart)
            ->exists();
        if ($dup) {
            throw ValidationException::withMessages([
                'period' => 'This member already has a saving entry for that month.',
            ]);
        }

        MonthlyDeposit::query()->create([
            'group_id' => $validated['group_id'],
            'member_id' => $validated['member_id'],
            'period' => $periodStart,
            'amount' => $validated['amount'],
            'status' => $validated['status'],
            'paid_at' => $validated['status'] === DepositStatus::Paid
                ? ($validated['paid_at'] ?? now()->toDateString())
                : null,
        ]);

        return redirect()->route('savings.index')->with('status', 'Saving record created.');
    }

    public function edit(Request $request, MonthlyDeposit $saving): Response
    {
        $companyId = (int) $request->user()->company_id;

        return Inertia::render('Savings/Edit', [
            'saving' => [
                'id' => $saving->id,
                'group_id' => $saving->group_id,
                'member_id' => $saving->member_id,
                'period' => $saving->period->format('Y-m-d'),
                'amount' => (string) $saving->amount,
                'status' => $saving->status->value,
                'paid_at' => $saving->paid_at?->format('Y-m-d'),
            ],
            'groups' => $this->groupOptions($companyId),
            'membersByGroup' => $this->membersByGroup($companyId),
        ]);
    }

    public function update(Request $request, MonthlyDeposit $saving): RedirectResponse
    {
        $companyId = (int) $request->user()->company_id;

        $validated = $request->validate([
            'group_id' => [
                'required',
                'integer',
                Rule::exists('groups', 'id')->where('company_id', $companyId),
            ],
            'member_id' => ['required', 'integer'],
            'period' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'status' => ['required', Rule::enum(DepositStatus::class)],
            'paid_at' => ['nullable', 'date', 'required_if:status,'.DepositStatus::Paid->value],
        ]);

        $member = Member::query()->findOrFail($validated['member_id']);
        if ($member->group_id !== (int) $validated['group_id']) {
            abort(422, 'Member does not belong to the selected group.');
        }

        $periodStart = Carbon::parse($validated['period'])->startOfMonth()->toDateString();

        $dup = MonthlyDeposit::query()
            ->where('member_id', $validated['member_id'])
            ->where('period', $periodStart)
            ->where('id', '!=', $saving->id)
            ->exists();
        if ($dup) {
            throw ValidationException::withMessages([
                'period' => 'This member already has a saving entry for that month.',
            ]);
        }

        $saving->update([
            'group_id' => $validated['group_id'],
            'member_id' => $validated['member_id'],
            'period' => $periodStart,
            'amount' => $validated['amount'],
            'status' => $validated['status'],
            'paid_at' => $validated['status'] === DepositStatus::Paid
                ? ($validated['paid_at'] ?? $saving->paid_at ?? now()->toDateString())
                : null,
        ]);

        return redirect()->route('savings.index')->with('status', 'Saving record updated.');
    }

    public function destroy(MonthlyDeposit $saving): RedirectResponse
    {
        $saving->delete();

        return redirect()->route('savings.index')->with('status', 'Saving record removed.');
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
