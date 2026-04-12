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

type CreateProps = {
    groups: GroupOption[];
    membersByGroup: MembersByGroup;
};

export default function Create({ groups, membersByGroup }: CreateProps) {
    const initialGroupId = groups[0]?.id ?? 0;
    const firstMemberId =
        membersByGroup[String(initialGroupId)]?.[0]?.id ?? 0;

    const { data, setData, post, processing, errors } = useForm({
        group_id: initialGroupId,
        member_id: firstMemberId,
        principal: '',
        issued_at: new Date().toISOString().slice(0, 10),
        due_date: '',
        status: 'active' as 'active' | 'closed',
        notes: '',
    });

    const memberOptions = useMemo(() => {
        return membersByGroup[String(data.group_id)] ?? [];
    }, [membersByGroup, data.group_id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('loans.store'));
    };

    return (
        <AppLayout title="New loan">
            <Head title="New loan" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle>New loan</CardTitle>
                    <CardDescription>
                        Principal and schedule; repayments are added after save.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="group_id">Group</Label>
                            <select
                                id="group_id"
                                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                                value={data.group_id || ''}
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
                                value={data.member_id || ''}
                                onChange={(e) =>
                                    setData('member_id', Number(e.target.value))
                                }
                                required
                                disabled={memberOptions.length === 0}
                            >
                                {memberOptions.length === 0 ? (
                                    <option value="">No members</option>
                                ) : null}
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
                            {errors.notes ? (
                                <p className="text-destructive text-sm">
                                    {errors.notes}
                                </p>
                            ) : null}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-between gap-3 border-t bg-muted/30">
                        <Button
                            type="submit"
                            disabled={processing || memberOptions.length === 0}
                        >
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
