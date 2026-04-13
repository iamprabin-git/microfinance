import { Badge } from '@/components/ui/badge';
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
import type { CompanyMemberOption } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import { PiggyBank } from 'lucide-react';
import type { FormEventHandler } from 'react';

type SavingEdit = {
    id: number;
    member_id: number;
    period: string;
    amount: string;
    status: string;
    paid_at: string | null;
    company_approval_status: string;
    currency: string;
};

type EditProps = {
    saving: SavingEdit;
    members: CompanyMemberOption[];
    canApproveRecords: boolean;
};

function memberOptionLabel(m: CompanyMemberOption): string {
    if (m.member_number != null) {
        return `${m.name} (#${m.member_number})`;
    }
    return m.name;
}

export default function Edit({ saving, members, canApproveRecords }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        member_id: saving.member_id,
        period: saving.period,
        amount: saving.amount,
        status: saving.status as 'pending' | 'paid',
        paid_at: saving.paid_at ?? '',
        company_approval_status: saving.company_approval_status as
            | 'approved'
            | 'pending_approval'
            | 'rejected',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('savings.update', saving.id));
    };

    return (
        <AppLayout
            title="Edit saving record"
            titleIcon={PiggyBank}
            hidePrint={false}
        >
            <Head title="Edit saving record" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={PiggyBank} size="sm" />
                        Edit monthly saving
                    </CardTitle>
                    <CardDescription>Adjust period, amount, or status.</CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        {errors.organization ? (
                            <p className="text-destructive text-sm">
                                {errors.organization}
                            </p>
                        ) : null}
                        {canApproveRecords ? (
                            <div className="grid gap-2">
                                <Label htmlFor="company_approval_status">
                                    Company approval
                                </Label>
                                <select
                                    id="company_approval_status"
                                    className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                                    value={data.company_approval_status}
                                    onChange={(e) =>
                                        setData(
                                            'company_approval_status',
                                            e.target.value as typeof data.company_approval_status,
                                        )
                                    }
                                    required
                                >
                                    <option value="approved">Approved</option>
                                    <option value="pending_approval">
                                        Pending approval
                                    </option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                {errors.company_approval_status ? (
                                    <p className="text-destructive text-sm">
                                        {errors.company_approval_status}
                                    </p>
                                ) : null}
                            </div>
                        ) : (
                            <div className="grid gap-1">
                                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                                    Company approval
                                </span>
                                <Badge
                                    variant={
                                        saving.company_approval_status ===
                                        'approved'
                                            ? 'secondary'
                                            : 'outline'
                                    }
                                >
                                    {saving.company_approval_status.replace(
                                        '_',
                                        ' ',
                                    )}
                                </Badge>
                                <p className="text-muted-foreground text-xs">
                                    Submitting updates sends this record to a
                                    company admin for approval.
                                </p>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="member_id">Member</Label>
                            <select
                                id="member_id"
                                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                                value={data.member_id}
                                onChange={(e) =>
                                    setData('member_id', Number(e.target.value))
                                }
                                required
                            >
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {memberOptionLabel(m)}
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
                            <Label htmlFor="period">Period</Label>
                            <Input
                                id="period"
                                type="date"
                                value={data.period}
                                onChange={(e) =>
                                    setData('period', e.target.value)
                                }
                                required
                            />
                            {errors.period ? (
                                <p className="text-destructive text-sm">
                                    {errors.period}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="amount">
                                Amount ({saving.currency})
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={data.amount}
                                onChange={(e) =>
                                    setData('amount', e.target.value)
                                }
                                required
                            />
                            {errors.amount ? (
                                <p className="text-destructive text-sm">
                                    {errors.amount}
                                </p>
                            ) : null}
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
                                        e.target.value as 'pending' | 'paid',
                                    )
                                }
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                        {data.status === 'paid' ? (
                            <div className="grid gap-2">
                                <Label htmlFor="paid_at">Paid on</Label>
                                <Input
                                    id="paid_at"
                                    type="date"
                                    value={data.paid_at}
                                    onChange={(e) =>
                                        setData('paid_at', e.target.value)
                                    }
                                />
                                {errors.paid_at ? (
                                    <p className="text-destructive text-sm">
                                        {errors.paid_at}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-between gap-3 border-t bg-muted/30">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save'}
                        </Button>
                        <Link
                            href={route('savings.index')}
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
