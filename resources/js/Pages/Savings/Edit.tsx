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
import AppLayout from '@/Layouts/AppLayout';
import type { GroupOption, MembersByGroup } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import type { FormEventHandler } from 'react';

type SavingEdit = {
    id: number;
    group_id: number;
    member_id: number;
    period: string;
    amount: string;
    status: string;
    paid_at: string | null;
};

type EditProps = {
    saving: SavingEdit;
    groups: GroupOption[];
    membersByGroup: MembersByGroup;
};

export default function Edit({ saving, groups, membersByGroup }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        group_id: saving.group_id,
        member_id: saving.member_id,
        period: saving.period,
        amount: saving.amount,
        status: saving.status as 'pending' | 'paid',
        paid_at: saving.paid_at ?? '',
    });

    const memberOptions = useMemo(() => {
        return membersByGroup[String(data.group_id)] ?? [];
    }, [membersByGroup, data.group_id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('savings.update', saving.id));
    };

    return (
        <AppLayout title="Edit saving record">
            <Head title="Edit saving record" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle>Edit monthly saving</CardTitle>
                    <CardDescription>Adjust period, amount, or status.</CardDescription>
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
                                        membersByGroup[String(gid)]?.[0]?.id ??
                                        0;
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
                                    setData('member_id', Number(e.target.value))
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
                            <Label htmlFor="amount">Amount</Label>
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
