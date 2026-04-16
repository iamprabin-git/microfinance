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
    type: string;
    label: string;
    type_label?: string;
    statement_title?: string;
    display_label?: string;
};

type Props = {
    accounts: AccountOption[];
};

type LineForm = {
    side: 'debit' | 'credit';
    chart_of_account_id: number;
    amount: string;
};

export default function Create({ accounts }: Props) {
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
    const optionLabel = (a: AccountOption): string => a.label;

    const firstAccountId = accounts[0]?.id ?? 0;

    const { data, setData, post, processing, errors } = useForm({
        voucher_date: new Date().toISOString().slice(0, 10),
        voucher_number: '',
        title: '',
        description: '',
        remarks: '',
        lines: [
            {
                side: 'debit',
                chart_of_account_id: firstAccountId,
                amount: '',
            },
            {
                side: 'credit',
                chart_of_account_id: firstAccountId,
                amount: '',
            },
        ] satisfies LineForm[],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('journal-vouchers.store'));
    };

    const lines = data.lines;

    const debitCount = lines.filter((l) => l.side === 'debit').length;
    const creditCount = lines.filter((l) => l.side === 'credit').length;

    const debitHeading = debitCount > 1 ? `Dr (${debitCount})` : 'Dr';
    const creditHeading = creditCount > 1 ? `Cr (${creditCount})` : 'Cr';

    const debitIndices = lines
        .map((l, i) => (l.side === 'debit' ? i : -1))
        .filter((i) => i >= 0);
    const creditIndices = lines
        .map((l, i) => (l.side === 'credit' ? i : -1))
        .filter((i) => i >= 0);

    const addLine = (side: 'debit' | 'credit') => {
        setData('lines', [
            ...lines,
            {
                side,
                chart_of_account_id: firstAccountId,
                amount: '',
            },
        ]);
    };

    const removeLine = (idx: number) => {
        const line = lines[idx];
        if (!line) return;
        if (line.side === 'debit' && debitCount <= 1) return;
        if (line.side === 'credit' && creditCount <= 1) return;
        setData(
            'lines',
            lines.filter((_, i) => i !== idx),
        );
    };

    const renderAccountSelect = (idx: number, value: number) => (
        <select
            className="border-input bg-background h-9 w-full rounded-lg border px-2 text-sm"
            value={value}
            onChange={(e) => {
                const next = [...lines];
                next[idx] = {
                    ...next[idx],
                    chart_of_account_id: Number(e.target.value),
                };
                setData('lines', next);
            }}
        >
            {typeOrder
                .filter((t) => (accountsByType[t] ?? []).length > 0)
                .map((t) => (
                    <optgroup key={`${idx}-${t}`} label={typeHeading(t)}>
                        {accountsByType[t].map((a) => (
                            <option key={a.id} value={a.id}>
                                {optionLabel(a)}
                            </option>
                        ))}
                    </optgroup>
                ))}
        </select>
    );

    return (
        <AppLayout title="New journal entry" titleIcon={NotebookPen} hidePrint={false}>
            <Head title="New journal entry" />

            <Card className="mx-auto max-w-4xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={NotebookPen} size="sm" />
                        New journal entry
                    </CardTitle>
                    <CardDescription>
                        Add one or more debit and credit lines. Totals must match.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="voucher_date">Date</Label>
                                <Input
                                    id="voucher_date"
                                    type="date"
                                    value={data.voucher_date}
                                    onChange={(e) =>
                                        setData('voucher_date', e.target.value)
                                    }
                                    required
                                />
                                {(errors as any).voucher_date ? (
                                    <p className="text-destructive text-sm">
                                        {(errors as any).voucher_date}
                                    </p>
                                ) : null}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="voucher_number">
                                    Voucher number (optional)
                                </Label>
                                <Input
                                    id="voucher_number"
                                    value={data.voucher_number}
                                    onChange={(e) =>
                                        setData('voucher_number', e.target.value)
                                    }
                                    placeholder="e.g. JV-2026-0001"
                                />
                                {(errors as any).voucher_number ? (
                                    <p className="text-destructive text-sm">
                                        {(errors as any).voucher_number}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. Cash deposit correction (or auto from Dr/Cr headings)"
                                required
                            />
                            {(errors as any).title ? (
                                <p className="text-destructive text-sm">
                                    {(errors as any).title}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (optional)</Label>
                            <textarea
                                id="description"
                                className="border-input bg-background min-h-[90px] w-full rounded-lg border px-3 py-2 text-sm"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                            />
                            {(errors as any).description ? (
                                <p className="text-destructive text-sm">
                                    {(errors as any).description}
                                </p>
                            ) : null}
                        </div>

                        {(errors as any).lines ? (
                            <p className="text-destructive text-sm">{(errors as any).lines}</p>
                        ) : null}

                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="overflow-x-auto rounded-lg border border-border/60">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 bg-muted/20 px-3 py-2">
                                    <div className="text-sm font-semibold">
                                        {debitHeading}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addLine('debit')}
                                    >
                                        <Plus className="mr-2 size-4" />
                                        Add
                                    </Button>
                                </div>
                                <table className="w-full min-w-[22rem] text-sm">
                                    <thead className="bg-muted/10">
                                        <tr className="text-left">
                                            <th className="px-3 py-2 font-semibold">
                                                Account
                                            </th>
                                            <th className="px-3 py-2 text-end font-semibold">
                                                Amount
                                            </th>
                                            <th className="px-3 py-2 text-end font-semibold">
                                                Remove
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {debitIndices.map((idx) => {
                                            const line = lines[idx];
                                            if (!line) return null;
                                            return (
                                                <tr
                                                    key={`dr-${idx}`}
                                                    className="border-t border-border/40"
                                                >
                                                    <td className="px-3 py-2">
                                                        {renderAccountSelect(
                                                            idx,
                                                            line.chart_of_account_id,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0.01"
                                                            inputMode="decimal"
                                                            className="text-right tabular-nums"
                                                            value={line.amount}
                                                            onChange={(e) => {
                                                                const next = [...lines];
                                                                next[idx] = {
                                                                    ...next[idx],
                                                                    amount: e.target.value,
                                                                };
                                                                setData('lines', next);
                                                            }}
                                                            required
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={debitCount <= 1}
                                                            onClick={() => removeLine(idx)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-border/60">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 bg-muted/20 px-3 py-2">
                                    <div className="text-sm font-semibold">
                                        {creditHeading}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addLine('credit')}
                                    >
                                        <Plus className="mr-2 size-4" />
                                        Add
                                    </Button>
                                </div>
                                <table className="w-full min-w-[22rem] text-sm">
                                    <thead className="bg-muted/10">
                                        <tr className="text-left">
                                            <th className="px-3 py-2 font-semibold">
                                                Account
                                            </th>
                                            <th className="px-3 py-2 text-end font-semibold">
                                                Amount
                                            </th>
                                            <th className="px-3 py-2 text-end font-semibold">
                                                Remove
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {creditIndices.map((idx) => {
                                            const line = lines[idx];
                                            if (!line) return null;
                                            return (
                                                <tr
                                                    key={`cr-${idx}`}
                                                    className="border-t border-border/40"
                                                >
                                                    <td className="px-3 py-2">
                                                        {renderAccountSelect(
                                                            idx,
                                                            line.chart_of_account_id,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0.01"
                                                            inputMode="decimal"
                                                            className="text-right tabular-nums"
                                                            value={line.amount}
                                                            onChange={(e) => {
                                                                const next = [...lines];
                                                                next[idx] = {
                                                                    ...next[idx],
                                                                    amount: e.target.value,
                                                                };
                                                                setData('lines', next);
                                                            }}
                                                            required
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={creditCount <= 1}
                                                            onClick={() => removeLine(idx)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="remarks">Remarks (optional)</Label>
                            <Input
                                id="remarks"
                                value={data.remarks}
                                onChange={(e) =>
                                    setData('remarks', e.target.value)
                                }
                                placeholder="Any note for this voucher"
                            />
                            {(errors as any).remarks ? (
                                <p className="text-destructive text-sm">
                                    {(errors as any).remarks}
                                </p>
                            ) : null}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-between gap-3 border-t bg-muted/30">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save entry'}
                        </Button>
                        <Link
                            href={route('journal-vouchers.index')}
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

