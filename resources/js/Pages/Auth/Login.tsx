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
import AuthPageShell from '@/Layouts/AuthPageShell';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';

type LoginProps = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthPageShell
            after={
                <p className="text-muted-foreground text-center text-sm">
                    Platform administrator?{' '}
                    <a
                        href="/admin/login"
                        className="text-foreground font-medium underline-offset-4 hover:underline"
                    >
                        Open admin panel
                    </a>
                </p>
            }
        >
            <Head title="Log in" />

            <Card className="w-full max-w-md shadow-md">
                <CardHeader>
                    <CardTitle>Sign in</CardTitle>
                    <CardDescription>
                        Use the email and password provided by your administrator.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        {status ? (
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                {status}
                            </p>
                        ) : null}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                autoFocus
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
                                autoComplete="current-password"
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
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                                className="border-input size-4 rounded"
                            />
                            Remember me
                        </label>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 border-t bg-muted/30 pt-4">
                        <div className="flex w-full flex-wrap items-center justify-between gap-2">
                            {canResetPassword ? (
                                <Link
                                    href={route('password.request')}
                                    className="text-muted-foreground text-sm underline-offset-4 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            ) : (
                                <span />
                            )}
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Signing in…' : 'Sign in'}
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </AuthPageShell>
    );
}
