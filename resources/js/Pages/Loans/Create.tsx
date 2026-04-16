import { Button, buttonVariants } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
import type { CompanyMemberOption } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import { Landmark } from 'lucide-react';
import type { FormEventHandler } from 'react';

type CreateProps = {
    members: CompanyMemberOption[];
    loan_products?: Array<{ id: number; code: string; name: string }>;
    currency: string;
    blockedReason?: string | null;
    default_member_id?: number | null;
};

export default function Create({
    members,
    loan_products = [],
    currency,
    blockedReason = null,
    default_member_id = null,
}: CreateProps) {
    const firstMemberId = default_member_id ?? members[0]?.id ?? 0;

    const { data, setData, post, processing, errors } = useForm({
        member_id: firstMemberId,
        product_code: loan_products[0]?.code ?? '',
        loan_account_number: '',
        principal: '',
        issued_at: new Date().toISOString().slice(0, 10),
        due_date: '',
        status: 'active' as 'active' | 'closed',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('loans.store'));
    };

    const disabled = processing || members.length === 0 || Boolean(blockedReason);

    return (
        <AppLayout title="New loan" titleIcon={Landmark} hidePrint={false}>
            <Head title="New loan" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={Landmark} size="sm" />
                        New loan
                    </CardTitle>
                    <CardDescription>
                        Principal and schedule; repayments are added after save.
                        Amounts use your organization&apos;s reporting currency
                        ({currency}).
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        {blockedReason ? (
                            <p className="text-destructive text-sm">
                                {blockedReason}
                            </p>
                        ) : null}
                        {errors.organization ? (
                            <p className="text-destructive text-sm">
                                {errors.organization}
                            </p>
                        ) : null}
                        <div className="grid gap-2">
                            <Label htmlFor="member_id">Member</Label>
                            <select
                                id="member_id"
                                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                                value={data.member_id || ''}
                                onChange={(e) =>
                                    setData('member_id', Number(e.target.value))
                                }
                                required
                                disabled={members.length === 0 || Boolean(blockedReason)}
                            >
                                {members.length === 0 ? (
                                    <option value="">No members</option>
                                ) : null}
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.member_number != null
                                            ? `SN#${m.member_number} · ${m.name}`
                                            : m.name}
                                    </option>
                                ))}
                            </select>
                            {errors.member_id ? (
                                <p className="text-destructive text-sm">
                                    {errors.member_id}
                                </p>
                            ) : null}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-muted-foreground text-xs">
                                    Can&apos;t find the member? Add them first.
                                </p>
                                <Link
                                    href={route('members.create', {
                                        redirect_to: route('loans.create'),
                                    })}
                                    className={cn(
                                        buttonVariants({
                                            variant: 'outline',
                                            size: 'sm',
                                        }),
                                    )}
                                >
                                    Add new member
                                </Link>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="product_code">
                                Loan product code
                            </Label>
                            <select
                                id="product_code"
                                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                                value={data.product_code}
                                onChange={(e) =>
                                    setData('product_code', e.target.value)
                                }
                                disabled={Boolean(blockedReason)}
                            >
                                <option value="">Default (LN)</option>
                                {loan_products.map((p) => (
                                    <option key={p.id} value={p.code}>
                                        {p.code} · {p.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-muted-foreground text-xs">
                                Auto account number copies this product code as
                                prefix when account field is blank.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="loan_account_number">
                                Loan account number (optional)
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
                                placeholder={
                                    data.product_code
                                        ? `${data.product_code}-000001`
                                        : 'Leave blank for auto (e.g. LN-000001)'
                                }
                                disabled={Boolean(blockedReason)}
                            />
                            {errors.loan_account_number ? (
                                <p className="text-destructive text-sm">
                                    {errors.loan_account_number}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="principal">
                                Principal ({currency})
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
                                disabled={Boolean(blockedReason)}
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
                                disabled={Boolean(blockedReason)}
                            />
                            {errors.issued_at ? (
                                <p className="text-destructive text-sm">
                                    {errors.issued_at}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="due_date">Due (optional)</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={data.due_date}
                                onChange={(e) =>
                                    setData('due_date', e.target.value)
                                }
                                disabled={Boolean(blockedReason)}
                            />
                            {errors.due_date ? (
                                <p className="text-destructive text-sm">
                                    {errors.due_date}
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
                                        e.target.value as 'active' | 'closed',
                                    )
                                }
                                disabled={Boolean(blockedReason)}
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
                                disabled={Boolean(blockedReason)}
                            />
                            {errors.notes ? (
                                <p className="text-destructive text-sm">
                                    {errors.notes}
                                </p>
                            ) : null}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-between gap-3 border-t bg-muted/30">
                        <Button type="submit" disabled={disabled}>
                            {processing ? 'Saving…' : 'Save'}
                        </Button>
                        <Link
                            href={route('loans.index')}
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
