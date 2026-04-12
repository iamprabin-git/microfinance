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
import type { GroupOption } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';

type MemberEdit = {
    id: number;
    group_id: number;
    name: string;
    email: string | null;
    phone: string | null;
};

type EditProps = {
    member: MemberEdit;
    groups: GroupOption[];
};

export default function Edit({ member, groups }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        group_id: member.group_id,
        name: member.name,
        email: member.email ?? '',
        phone: member.phone ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('members.update', member.id));
    };

    return (
        <AppLayout title="Edit member">
            <Head title="Edit member" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle>Edit member</CardTitle>
                    <CardDescription>Update profile and group assignment.</CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="group_id">Group</Label>
                            <select
                                id="group_id"
                                className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
                                value={data.group_id}
                                onChange={(e) =>
                                    setData('group_id', Number(e.target.value))
                                }
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
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                required
                            />
                            {errors.name ? (
                                <p className="text-destructive text-sm">
                                    {errors.name}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                            />
                            {errors.email ? (
                                <p className="text-destructive text-sm">
                                    {errors.email}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                            />
                            {errors.phone ? (
                                <p className="text-destructive text-sm">
                                    {errors.phone}
                                </p>
                            ) : null}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-between gap-3 border-t bg-muted/30">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save'}
                        </Button>
                        <Link
                            href={route('members.index')}
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
