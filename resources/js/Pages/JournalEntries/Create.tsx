import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { HeadingIcon } from '@/components/ui/heading-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { NotebookPen, Plus, Trash2 } from 'lucide-react';
import type { FormEventHandler } from 'react';

type AccountOption = {
    id: number;
    label: string;
    type: string;
    type_label?: string;
    statement_title?: string;
    display_label?: string;
};

type CreateProps = {
    accounts: AccountOption[];
    members: {
        id: number;
        name: string;
        member_number: number | null;
        savings_account_number: string | null;
    }[];
    loans: {
        id: number;
        loan_account_number: string | null;
        issued_at: string | null;
        principal: string;
        member: { id: number | null; name: string };
    }[];
};

type LineForm = {
    chart_of_account_id: number;
    debit: string;
    credit: string;
    description: string;
};

export default function Create({ accounts, members, loans }: CreateProps) {
    const firstAccountId = accounts[0]?.id ?? 0;
    const accountsByType = accounts.reduce(
        (acc, a) => {
            const key = a.type ?? 'other';
            if (!acc[key]) acc[key] = [];
            acc[key].push(a);
            return acc;
        },
        {} as Record<string, AccountOption[]>,
    );

    const typeOrder = ['asset', 'liability', 'capital', 'income', 'expense', 'other'];

    const typeHeading = (type: string): string => {
        const first = accountsByType[type]?.[0];
        return first?.type_label
            ? first.type_label
            : type === 'asset'
              ? 'Assets'
              : type === 'liability'
                ? 'Liabilities'
                : type === 'capital'
                  ? 'Capital'
                  : type === 'income'
                    ? 'Income'
                    : type === 'expense'
                      ? 'Expenses'
                      : 'Other';
    };

    const optionLabel = (a: AccountOption): string =>
        a.display_label?.trim() ? a.display_label : a.label;

    const { data, setData, post, processing, errors } = useForm({
        occurred_at: new Date().toISOString().slice(0, 10),
        reference: '',
        memo: '',
        member_id: null as number | null,
        loan_id: null as number | null,
        lines: [
            {
                chart_of_account_id: firstAccountId,
                debit: '',
                credit: '',
                description: '',
            } satisfies LineForm,
            {
                chart_of_account_id: firstAccountId,
                debit: '',
                credit: '',
                description: '',
            } satisfies LineForm,
        ],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('journal-entries.store'));
    };

    const lines = data.lines;

    return (
        <AppLayout title="New journal entry" titleIcon={NotebookPen} hidePrint={false}>
            <Head title="New journal entry" />

            <Card className="mx-auto max-w-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={NotebookPen} size="sm" />
                        New journal entry
                    </CardTitle>
                    <CardDescription>
                        Post an adjustment. Total debits must equal total credits.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-5">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="occurred_at">Date</Label>
                                <Input
                                    id="occurred_at"
                                    type="date"
                                    value={data.occurred_at}
                                    onChange={(e) =>
                                        setData('occurred_at', e.target.value)
                                    }
                                    required
                                />
                                {errors.occurred_at ? (
                                    <p className="text-destructive text-sm">
                                        {errors.occurred_at}
                                    </p>
                                ) : null}
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="reference">Reference (optional)</Label>
                                <Input
                                    id="reference"
                                    value={data.reference}
                                    onChange={(e) =>
                                        setData('reference', e.target.value)
                                    }
                                    placeholder="e.g. ADJ-2026-04-001"
                                />
                                {errors.reference ? (
                                    <p className="text-destructive text-sm">
                                        {errors.reference}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="memo">Memo (optional)</Label>
                            <textarea
                                id="memo"
                                className="border-input bg-background min-h-[90px] w-full rounded-lg border px-3 py-2 text-sm"
                                value={data.memo}
                                onChange={(e) => setData('memo', e.target.value)}
                            />
                            {errors.memo ? (
                                <p className="text-destructive text-sm">
                                    {errors.memo}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="member_id">
                                    Related member (optional)
                                </Label>
                                <select
                                    id="member_id"
                                    className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                                    value={data.member_id ?? ''}
                                    onChange={(e) =>
                                        setData(
                                            'member_id',
                                            e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                        )
                                    }
                                >
                                    <option value="">—</option>
                                    {members.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {[
                                                m.name,
                                                m.member_number != null
                                                    ? `#${m.member_number}`
                                                    : null,
                                                m.savings_account_number,
                                            ]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </option>
                                    ))}
                                </select>
                                {(errors as any).member_id ? (
                                    <p className="text-destructive text-sm">
                                        {(errors as any).member_id}
                                    </p>
                                ) : null}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="loan_id">Related loan (optional)</Label>
                                <select
                                    id="loan_id"
                                    className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                                    value={data.loan_id ?? ''}
                                    onChange={(e) =>
                                        setData(
                                            'loan_id',
                                            e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                        )
                                    }
                                >
                                    <option value="">—</option>
                                    {loans.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {[
                                                l.loan_account_number ??
                                                    `Loan #${l.id}`,
                                                l.member?.name,
                                                l.issued_at,
                                            ]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </option>
                                    ))}
                                </select>
                                {(errors as any).loan_id ? (
                                    <p className="text-destructive text-sm">
                                        {(errors as any).loan_id}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        {errors.lines ? (
                            <p className="text-destructive text-sm">
                                {errors.lines}
                            </p>
                        ) : null}

                        <div className="overflow-x-auto rounded-lg border border-border/60">
                            <table className="w-full min-w-[52rem] text-sm">
                                <thead className="bg-muted/20">
                                    <tr className="text-left">
                                        <th className="px-3 py-2 font-semibold">
                                            Account
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Description
                                        </th>
                                        <th className="px-3 py-2 text-right font-semibold">
                                            Debit
                                        </th>
                                        <th className="px-3 py-2 text-right font-semibold">
                                            Credit
                                        </th>
                                        <th className="px-3 py-2 text-right font-semibold">
                                            Remove
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map((line, idx) => (
                                        <tr
                                            key={idx}
                                            className="border-t border-border/40"
                                        >
                                            <td className="px-3 py-2">
                                                <select
                                                    className="border-input bg-background h-9 w-full rounded-lg border px-2 text-sm"
                                                    value={line.chart_of_account_id}
                                                    onChange={(e) => {
                                                        const next = [...lines];
                                                        next[idx] = {
                                                            ...next[idx],
                                                            chart_of_account_id: Number(
                                                                e.target.value,
                                                            ),
                                                        };
                                                        setData('lines', next);
                                                    }}
                                                >
                                                    {typeOrder
                                                        .filter(
                                                            (t) =>
                                                                (accountsByType[t] ?? [])
                                                                    .length > 0,
                                                        )
                                                        .map((t) => (
                                                            <optgroup
                                                                key={t}
                                                                label={typeHeading(t)}
                                                            >
                                                                {accountsByType[t].map(
                                                                    (a) => (
                                                                        <option
                                                                            key={a.id}
                                                                            value={a.id}
                                                                        >
                                                                            {optionLabel(a)}
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </optgroup>
                                                        ))}
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input
                                                    value={line.description}
                                                    onChange={(e) => {
                                                        const next = [...lines];
                                                        next[idx] = {
                                                            ...next[idx],
                                                            description: e.target.value,
                                                        };
                                                        setData('lines', next);
                                                    }}
                                                    placeholder="Optional line note"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    inputMode="decimal"
                                                    className="text-right tabular-nums"
                                                    value={line.debit}
                                                    onChange={(e) => {
                                                        const next = [...lines];
                                                        next[idx] = {
                                                            ...next[idx],
                                                            debit: e.target.value,
                                                        };
                                                        setData('lines', next);
                                                    }}
                                                    placeholder="0.00"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    inputMode="decimal"
                                                    className="text-right tabular-nums"
                                                    value={line.credit}
                                                    onChange={(e) => {
                                                        const next = [...lines];
                                                        next[idx] = {
                                                            ...next[idx],
                                                            credit: e.target.value,
                                                        };
                                                        setData('lines', next);
                                                    }}
                                                    placeholder="0.00"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={lines.length <= 2}
                                                    onClick={() => {
                                                        if (lines.length <= 2) return;
                                                        const next = lines.filter(
                                                            (_, i) => i !== idx,
                                                        );
                                                        setData('lines', next);
                                                    }}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setData('lines', [
                                        ...lines,
                                        {
                                            chart_of_account_id: firstAccountId,
                                            debit: '',
                                            credit: '',
                                            description: '',
                                        },
                                    ]);
                                }}
                            >
                                <Plus className="mr-2 size-4" />
                                Add line
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-between gap-3 border-t bg-muted/30">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Posting…' : 'Post entry'}
                        </Button>
                        <Link
                            href={route('journal-entries.index')}
                            className="text-muted-foreground text-sm underline-offset-4 hover:underline"
                        >
                            Cancel
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </AppLayout>
    );
}

