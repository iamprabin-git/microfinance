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
import AuthPageShell from '@/Layouts/AuthPageShell';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import type { FormEventHandler } from 'react';

type ResetPasswordProps = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthPageShell>
            <Head title="Reset Password" />

            <Card className="w-full max-w-md shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={KeyRound} size="sm" />
                        Set a new password
                    </CardTitle>
                    <CardDescription>
                        Choose a strong password for your account.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                aria-invalid={errors.email ? 'true' : 'false'}
                            />
                            {errors.email ? (
                                <p className="text-destructive text-sm">
                                    {errors.email}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                autoComplete="new-password"
                                autoFocus
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                aria-invalid={
                                    errors.password ? 'true' : 'false'
                                }
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
                                name="password_confirmation"
                                value={data.password_confirmation}
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                aria-invalid={
                                    errors.password_confirmation
                                        ? 'true'
                                        : 'false'
                                }
                            />
                            {errors.password_confirmation ? (
                                <p className="text-destructive text-sm">
                                    {errors.password_confirmation}
                                </p>
                            ) : null}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t bg-muted/30 pt-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Resetting…' : 'Reset password'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </AuthPageShell>
    );
}
