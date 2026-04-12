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
import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthPageShell>
            <Head title="Confirm Password" />

            <Card className="w-full max-w-md shadow-md">
                <CardHeader>
                    <CardTitle>Confirm password</CardTitle>
                    <CardDescription>
                        This is a secure area. Enter your password to continue.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                autoComplete="current-password"
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
                    </CardContent>
                    <CardFooter className="flex justify-end border-t bg-muted/30 pt-4">
                        <Button type="submit" disabled={processing}>
                            Confirm
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </AuthPageShell>
    );
}
