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
import { MailQuestionMark } from 'lucide-react';
import type { FormEventHandler } from 'react';

type ForgotPasswordProps = {
    status?: string;
};

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthPageShell>
            <Head title="Forgot Password" />

            <Card className="w-full max-w-md shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={MailQuestionMark} size="sm" />
                        Forgot password
                    </CardTitle>
                    <CardDescription>
                        Enter your email and we will send a reset link.
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
                    </CardContent>
                    <CardFooter className="flex justify-end border-t bg-muted/30 pt-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Sending…' : 'Email reset link'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </AuthPageShell>
    );
}
