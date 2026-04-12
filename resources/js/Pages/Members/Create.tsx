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

type CreateProps = {
    groups: GroupOption[];
};

export default function Create({ groups }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        group_id: groups[0]?.id ?? 0,
        name: '',
        email: '',
        phone: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('members.store'));
    };

    return (
        <AppLayout title="Add member">
            <Head title="Add member" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle>New member</CardTitle>
                    <CardDescription>
                        Assign the member to one of your savings groups.
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
                                onChange={(e) =>
                                    setData(
                                        'group_id',
                                        Number(e.target.value),
                                    )
                                }
                                required
                                disabled={groups.length === 0}
                            >
                                {groups.length === 0 ? (
                                    <option value="">No groups</option>
                                ) : null}
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
                        <Button
                            type="submit"
                            disabled={processing || groups.length === 0}
                        >
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
