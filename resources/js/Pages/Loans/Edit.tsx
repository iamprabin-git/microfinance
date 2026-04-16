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
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/Layouts/AppLayout';
import type { CompanyMemberOption } from '@/types/models';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Landmark, ListOrdered } from 'lucide-react';
import type { FormEventHandler } from 'react';

type RepaymentRow = {
    id: number;
    amount: string;
    paid_at: string;
    notes: string | null;
};

type LoanEdit = {
    id: number;
    member_id: number;
    loan_account_number: string | null;
    principal: string;
    issued_at: string;
    due_date: string | null;
    status: string;
    notes: string | null;
    company_approval_status: string;
    currency: string;
    repayments: RepaymentRow[];
};

type EditProps = {
    loan: LoanEdit;
    members: CompanyMemberOption[];
    canRepay: boolean;
    canApproveRecords: boolean;
};

export default function Edit({
    loan,
    members,
    canRepay,
    canApproveRecords,
}: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        member_id: loan.member_id,
        loan_account_number: loan.loan_account_number ?? '',
        principal: loan.principal,
        issued_at: loan.issued_at,
        due_date: loan.due_date ?? '',
        status: loan.status as 'active' | 'closed',
        notes: loan.notes ?? '',
        company_approval_status: loan.company_approval_status as
            | 'approved'
            | 'pending_approval'
            | 'rejected',
    });

    const repayForm = useForm({
        amount: '',
        paid_at: new Date().toISOString().slice(0, 10),
        notes: '',
    });

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
        <AppLayout title="Loan details" titleIcon={Landmark} hidePrint={false}>
            <Head title="Loan details" />

            <div className="mx-auto grid max-w-lg gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HeadingIcon icon={Landmark} size="sm" />
                            Edit loan
                        </CardTitle>
                        <CardDescription>
                            Update terms; record repayments below when active
                            and company-approved.
                        </CardDescription>
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
                                        <option value="approved">
                                            Approved
                                        </option>
                                        <option value="pending_approval">
                                            Pending approval
                                        </option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    {errors.company_approval_status ? (
                                        <p className="text-destructive text-sm">
                                            {
                                                errors.company_approval_status
                                            }
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
                                            loan.company_approval_status ===
                                            'approved'
                                                ? 'secondary'
                                                : 'outline'
                                        }
                                    >
                                        {loan.company_approval_status.replace(
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
                                        setData(
                                            'member_id',
                                            Number(e.target.value),
                                        )
                                    }
                                    required
                                >
                                    {members.map((m) => (
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
                                <Label htmlFor="loan_account_number">
                                    Loan account number
                                </Label>
                                <Input
                                    id="loan_account_number"
                                    value={data.loan_account_number}
                                    onChange={(e) =>
                                        setData(
                                            'loan_account_number',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. LN-000045"
                                />
                                {errors.loan_account_number ? (
                                    <p className="text-destructive text-sm">
                                        {errors.loan_account_number}
                                    </p>
                                ) : null}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="principal">
                                    Principal ({loan.currency})
                                </Label>
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
                                href={route('loans.statement', loan.id)}
                                className="text-sm underline-offset-4 hover:underline"
                            >
                                Statement
                            </Link>
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
                        <CardTitle className="flex items-center gap-2">
                            <HeadingIcon icon={ListOrdered} size="sm" />
                            Repayments
                        </CardTitle>
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
                                            {loan.currency} {r.amount}
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

                        {canRepay &&
                        loan.status === 'active' &&
                        loan.company_approval_status === 'approved' ? (
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
                                                Amount ({loan.currency})
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
