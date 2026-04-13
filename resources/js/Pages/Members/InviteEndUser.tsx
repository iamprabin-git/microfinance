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
import { UserPlus } from 'lucide-react';
import type { FormEventHandler } from 'react';

type MemberSummary = {
    id: number;
    name: string;
    email: string;
};

type InviteProps = {
    member: MemberSummary;
};

export default function InviteEndUser({ member }: InviteProps) {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('members.end-user.store', member.id));
    };

    return (
        <AppLayout title="Create end user" titleIcon={UserPlus}>
            <Head title="Create end user" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={UserPlus} size="sm" />
                        End user from member
                    </CardTitle>
                    <CardDescription>
                        Creates a login that only sees savings and loans for this
                        member (matched by the email below).
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-1 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                                Member
                            </span>
                            <span className="font-medium">{member.name}</span>
                            <span className="text-muted-foreground">{member.email}</span>
                        </div>
                        {errors.email ? (
                            <p className="text-destructive text-sm">{errors.email}</p>
                        ) : null}
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                required
                                autoComplete="new-password"
                            />
                            {errors.password ? (
                                <p className="text-destructive text-sm">
                                    {errors.password}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Confirm password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-between gap-3 border-t bg-muted/30">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating…' : 'Create end user'}
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
