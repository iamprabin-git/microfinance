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
import { Receipt } from 'lucide-react';
import type { FormEventHandler } from 'react';

type MemberOpt = {
    id: number;
    name: string;
    member_number: number | null;
    savings_account_number: string | null;
};

type Props = {
    members: MemberOpt[];
    currency: string;
    default_member_id: number | null;
    default_type: 'deposit' | 'withdraw';
    blockedReason?: string | null;
};

function memberLabel(m: MemberOpt): string {
    const bits = [m.name];
    if (m.member_number != null) bits.push(`#${m.member_number}`);
    if (m.savings_account_number) bits.push(m.savings_account_number);
    return bits.join(' · ');
}

export default function Create({
    members,
    currency,
    default_member_id,
    default_type,
    blockedReason = null,
}: Props) {
    const firstMemberId = default_member_id ?? members[0]?.id ?? 0;
    const memberLocked = default_member_id !== null;

    const { data, setData, post, processing, errors } = useForm({
        member_id: firstMemberId,
        type: default_type as 'withdraw' | 'deposit',
        amount: '',
        occurred_at: new Date().toISOString().slice(0, 10),
        reference: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('savings-transactions.store'));
    };

    const disabled =
        processing || members.length === 0 || Boolean(blockedReason);

    return (
        <AppLayout title="New savings transaction" titleIcon={Receipt} hidePrint={false}>
            <Head title="New savings transaction" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={Receipt} size="sm" />
                        New transaction
                    </CardTitle>
                    <CardDescription>
                        Record a deposit or withdrawal. Amounts use {currency}.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        {blockedReason ? (
                            <p className="text-destructive text-sm">
                                {blockedReason}
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
                                disabled={disabled || memberLocked}
                            >
                                {members.length === 0 ? (
                                    <option value="">No eligible members</option>
                                ) : null}
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {memberLabel(m)}
                                    </option>
                                ))}
                            </select>
                            {errors.member_id ? (
                                <p className="text-destructive text-sm">
                                    {errors.member_id}
                                </p>
                            ) : null}
                            {memberLocked ? (
                                <p className="text-muted-foreground text-xs">
                                    Member is fixed for this deposit/withdrawal.
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <select
                                id="type"
                                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                                value={data.type}
                                onChange={(e) =>
                                    setData(
                                        'type',
                                        e.target.value as 'withdraw' | 'deposit',
                                    )
                                }
                                disabled={disabled}
                            >
                                <option value="withdraw">Withdraw</option>
                                <option value="deposit">Deposit</option>
                            </select>
                            {errors.type ? (
                                <p className="text-destructive text-sm">
                                    {errors.type}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount ({currency})</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                required
                                disabled={disabled}
                            />
                            {errors.amount ? (
                                <p className="text-destructive text-sm">
                                    {errors.amount}
                                </p>
                            ) : null}
                        </div>

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
                                disabled={disabled}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="reference">Reference (optional)</Label>
                            <Input
                                id="reference"
                                value={data.reference}
                                onChange={(e) =>
                                    setData('reference', e.target.value)
                                }
                                placeholder="Voucher / bank ref"
                                disabled={disabled}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <textarea
                                id="notes"
                                className="border-input bg-background min-h-[90px] w-full rounded-lg border px-3 py-2 text-sm"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                disabled={disabled}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-between gap-3 border-t bg-muted/30">
                        <Button type="submit" disabled={disabled}>
                            {processing ? 'Saving…' : 'Save'}
                        </Button>
                        <Link
                            href={route('savings-transactions.index')}
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

