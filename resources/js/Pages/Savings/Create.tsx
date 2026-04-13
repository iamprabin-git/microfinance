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
import { useEffect } from 'react';

type CreateProps = {
    members: CompanyMemberOption[];
    currency: string;
    default_member_id?: number | null;
    blockedReason?: string | null;
};

function memberOptionLabel(m: CompanyMemberOption): string {
    if (m.member_number != null) {
        return `${m.name} (#${m.member_number})`;
    }
    return m.name;
}

export default function Create({
    members,
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
                        One row per member per calendar month. Amounts use your
                        organization&apos;s reporting currency ({currency}).
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
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="period">Period (any day in month)</Label>
                            <Input
                                id="period"
                                type="date"
                                value={data.period}
                                onChange={(e) =>
                                    setData('period', e.target.value)
                                }
                                required
                                disabled={Boolean(blockedReason)}
                            />
                            {errors.period ? (
                                <p className="text-destructive text-sm">
                                    {errors.period}
                                </p>
                            ) : null}
                        </div>
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
