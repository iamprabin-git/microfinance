import { Button, buttonVariants } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthPageShell>
            <Head title="Register" />

            <Card className="w-full max-w-md shadow-md">
                <CardHeader>
                    <CardTitle>Create account</CardTitle>
                    <CardDescription>
                        Registration may be disabled in this deployment.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                autoComplete="name"
                                autoFocus
                                required
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                aria-invalid={errors.name ? 'true' : 'false'}
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
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                required
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
                                required
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
                                required
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
                    <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 pt-4">
                        <Link
                            href={route('login')}
                            className={cn(
                                buttonVariants({ variant: 'ghost', size: 'sm' }),
                            )}
                        >
                            Already registered?
                        </Link>
                        <Button type="submit" disabled={processing}>
                            Register
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </AuthPageShell>
    );
}
