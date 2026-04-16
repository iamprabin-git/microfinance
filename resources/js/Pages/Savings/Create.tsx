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
import { PiggyBank } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { useEffect } from 'react';

type CreateProps = {
    members: CompanyMemberOption[];
    members_pending_savings_account?: CompanyMemberOption[];
    saving_products?: Array<{ id: number; code: string; name: string }>;
    currency: string;
    default_member_id?: number | null;
    blockedReason?: string | null;
};

function memberOptionLabel(m: CompanyMemberOption): string {
    const serial =
        m.member_number != null ? `Serial #${m.member_number}` : null;
    const acct = m.savings_account_number?.trim() || null;
    const bits = [m.name];
    if (serial) bits.push(serial);
    if (acct) bits.push(acct);
    return bits.join(' · ');
}

export default function Create({
    members,
    members_pending_savings_account = [],
    saving_products = [],
    currency,
    default_member_id = null,
    blockedReason = null,
}: CreateProps) {
    const resolvedDefault =
        default_member_id != null &&
        members.some((m) => m.id === default_member_id)
            ? default_member_id
            : (members[0]?.id ?? 0);

    const { data, setData, post, processing, errors } = useForm({
        member_id: resolvedDefault,
        period: new Date().toISOString().slice(0, 10),
        amount: '',
        status: 'pending' as 'pending' | 'paid',
        paid_at: '',
    });

    const pendingDefaultMember =
        members_pending_savings_account[0]?.id ?? 0;
    const pendingDefaultProductCode =
        saving_products[0]?.code ?? '';
    const {
        data: accountData,
        setData: setAccountData,
        post: postAccount,
        processing: openingAccount,
        errors: accountErrors,
    } = useForm({
        member_id: pendingDefaultMember,
        product_code: pendingDefaultProductCode,
    });

    useEffect(() => {
        if (
            default_member_id != null &&
            members.some((m) => m.id === default_member_id)
        ) {
            setData('member_id', default_member_id);
        }
    }, [default_member_id, members, setData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('savings.store'));
    };
    const openAccount = () => {
        if (!accountData.member_id) return;
        postAccount(
            route('members.savings-account.store', accountData.member_id),
            {
                data: {
                    product_code: accountData.product_code,
                    redirect_to: route('savings.create'),
                },
            },
        );
    };

    const disabled = processing || members.length === 0 || Boolean(blockedReason);

    return (
        <AppLayout
            title="Add saving record"
            titleIcon={PiggyBank}
            hidePrint={false}
        >
            <Head title="Add saving record" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={PiggyBank} size="sm" />
                        Monthly saving
                    </CardTitle>
                    <CardDescription>
                        One row per member per calendar month (current month is
                        used automatically). Only members with a serial number
                        and an issued savings account appear here. Amounts use{' '}
                        {currency}.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        {members_pending_savings_account.length > 0 ? (
                            <div className="rounded-lg border border-dashed p-3 sm:p-4">
                                <p className="text-sm font-medium">
                                    Create savings account
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    Select member by SN/name and copy product
                                    code to open savings account first.
                                </p>
                                <div className="mt-3 grid gap-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="account_member_id">
                                            Member (SN / Name)
                                        </Label>
                                        <select
                                            id="account_member_id"
                                            className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                                            value={
                                                accountData.member_id || ''
                                            }
                                            onChange={(e) =>
                                                setAccountData(
                                                    'member_id',
                                                    Number(e.target.value),
                                                )
                                            }
                                            required
                                        >
                                            {members_pending_savings_account.map(
                                                (m) => (
                                                    <option
                                                        key={m.id}
                                                        value={m.id}
                                                    >
                                                        {m.member_number != null
                                                            ? `SN#${m.member_number} · ${m.name}`
                                                            : m.name}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        {accountErrors.member_id ? (
                                            <p className="text-destructive text-xs">
                                                {accountErrors.member_id}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="account_product_code">
                                            Savings product code
                                        </Label>
                                        <select
                                            id="account_product_code"
                                            className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                                            value={accountData.product_code}
                                            onChange={(e) =>
                                                setAccountData(
                                                    'product_code',
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Default (SAV)
                                            </option>
                                            {saving_products.map((p) => (
                                                <option
                                                    key={p.id}
                                                    value={p.code}
                                                >
                                                    {p.code} · {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={openingAccount}
                                            onClick={openAccount}
                                        >
                                            {openingAccount
                                                ? 'Opening...'
                                                : 'Open savings account'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : null}

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
                                    <option value="">No members yet</option>
                                ) : null}
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
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-muted-foreground text-xs">
                                    Can&apos;t find the member? Add them first.
                                </p>
                                <Link
                                    href={route('members.create', {
                                        redirect_to: route('savings.create'),
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
                        <input type="hidden" name="period" value={data.period} />
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount ({currency})</Label>
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
                                disabled={Boolean(blockedReason)}
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
                                disabled={Boolean(blockedReason)}
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                            </select>
                            {errors.status ? (
                                <p className="text-destructive text-sm">
                                    {errors.status}
                                </p>
                            ) : null}
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
                                    disabled={Boolean(blockedReason)}
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
                        <Button type="submit" disabled={disabled}>
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
