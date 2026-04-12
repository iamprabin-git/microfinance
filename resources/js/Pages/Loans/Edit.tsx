import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/Layouts/AppLayout';
import type { GroupOption, MembersByGroup } from '@/types/models';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import type { FormEventHandler } from 'react';

type RepaymentRow = {
    id: number;
    amount: string;
    paid_at: string;
    notes: string | null;
};

type LoanEdit = {
    id: number;
    group_id: number;
    member_id: number;
    principal: string;
    issued_at: string;
    due_date: string | null;
    status: string;
    notes: string | null;
    repayments: RepaymentRow[];
};

type EditProps = {
    loan: LoanEdit;
    groups: GroupOption[];
    membersByGroup: MembersByGroup;
    canRepay: boolean;
};

export default function Edit({
    loan,
    groups,
    membersByGroup,
    canRepay,
}: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        group_id: loan.group_id,
        member_id: loan.member_id,
        principal: loan.principal,
        issued_at: loan.issued_at,
        due_date: loan.due_date ?? '',
        status: loan.status as 'active' | 'closed',
        notes: loan.notes ?? '',
    });

    const repayForm = useForm({
        amount: '',
        paid_at: new Date().toISOString().slice(0, 10),
        notes: '',
    });

    const memberOptions = useMemo(() => {
        return membersByGroup[String(data.group_id)] ?? [];
    }, [membersByGroup, data.group_id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('loans.update', loan.id));
    };

    const submitRepay: FormEventHandler = (e) => {
        e.preventDefault();
        repayForm.post(route('loans.repayments.store', loan.id), {
            preserveScroll: true,
            onSuccess: () => {
                repayForm.reset();
                router.reload();
            },
        });
    };

    return (
        <AppLayout title="Loan details">
            <Head title="Loan details" />

            <div className="mx-auto grid max-w-lg gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit loan</CardTitle>
                        <CardDescription>
                            Update terms; record repayments below when active.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="group_id">Group</Label>
                                <select
                                    id="group_id"
                                    className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                                    value={data.group_id}
                                    onChange={(e) => {
                                        const gid = Number(e.target.value);
                                        setData('group_id', gid);
                                        const first =
                                            membersByGroup[String(gid)]?.[0]
                                                ?.id ?? 0;
                                        setData('member_id', first);
                                    }}
                                    required
                                >
                                    {groups.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.name} ({g.currency})
                                        </option>
                                    ))}
                                </select>
                                {errors.group_id ? (
                                    <p className="text-destructive text-sm">
                                        {errors.group_id}
                                    </p>
                                ) : null}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="member_id">Member</Label>
                                <select
                                    id="member_id"
                                    className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                                    value={data.member_id}
                                    onChange={(e) =>
                                        setData(
                                            'member_id',
                                            Number(e.target.value),
                                        )
                                    }
                                    required
                                >
                                    {memberOptions.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.member_id ? (
                                    <p className="text-destructive text-sm">
                                        {errors.member_id}
                                    </p>
                                ) : null}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="principal">Principal</Label>
                                <Input
                                    id="principal"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={data.principal}
                                    onChange={(e) =>
                                        setData('principal', e.target.value)
                                    }
                                    required
                                />
                                {errors.principal ? (
                                    <p className="text-destructive text-sm">
                                        {errors.principal}
                                    </p>
                                ) : null}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="issued_at">Issued</Label>
                                <Input
                                    id="issued_at"
                                    type="date"
                                    value={data.issued_at}
                                    onChange={(e) =>
                                        setData('issued_at', e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="due_date">Due</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e) =>
                                        setData('due_date', e.target.value)
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                                    value={data.status}
                                    onChange={(e) =>
                                        setData(
                                            'status',
                                            e.target.value as
                                                | 'active'
                                                | 'closed',
                                        )
                                    }
                                >
                                    <option value="active">Active</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    className="border-input bg-background min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm"
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-wrap justify-between gap-3 border-t bg-muted/30">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving…' : 'Save loan'}
                            </Button>
                            <Link
                                href={route('loans.index')}
                                className="text-muted-foreground text-sm underline-offset-4 hover:underline"
                            >
                                Back to list
                            </Link>
                        </CardFooter>
                    </form>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Repayments</CardTitle>
                        <CardDescription>
                            Total repaid updates automatically. Loan closes when
                            sum reaches principal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loan.repayments.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                No repayments yet.
                            </p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {loan.repayments.map((r) => (
                                    <li
                                        key={r.id}
                                        className="flex flex-wrap justify-between gap-2 border-b border-border/60 py-2 last:border-0"
                                    >
                                        <span className="font-medium tabular-nums">
                                            {r.amount}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {r.paid_at}
                                        </span>
                                        {r.notes ? (
                                            <span className="text-muted-foreground w-full text-xs">
                                                {r.notes}
                                            </span>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {canRepay && loan.status === 'active' ? (
                            <>
                                <Separator />
                                <form
                                    onSubmit={submitRepay}
                                    className="grid gap-3"
                                >
                                    <p className="text-sm font-medium">
                                        Record repayment
                                    </p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="r_amount">
                                                Amount
                                            </Label>
                                            <Input
                                                id="r_amount"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={repayForm.data.amount}
                                                onChange={(e) =>
                                                    repayForm.setData(
                                                        'amount',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            {repayForm.errors.amount ? (
                                                <p className="text-destructive text-xs">
                                                    {repayForm.errors.amount}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="r_paid_at">
                                                Paid on
                                            </Label>
                                            <Input
                                                id="r_paid_at"
                                                type="date"
                                                value={repayForm.data.paid_at}
                                                onChange={(e) =>
                                                    repayForm.setData(
                                                        'paid_at',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="r_notes">Notes</Label>
                                        <Input
                                            id="r_notes"
                                            value={repayForm.data.notes}
                                            onChange={(e) =>
                                                repayForm.setData(
                                                    'notes',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={repayForm.processing}
                                    >
                                        {repayForm.processing
                                            ? 'Saving…'
                                            : 'Add repayment'}
                                    </Button>
                                </form>
                            </>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
