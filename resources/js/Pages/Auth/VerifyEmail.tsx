import { Button, buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { HeadingIcon } from '@/components/ui/heading-icon';
import AuthPageShell from '@/Layouts/AuthPageShell';
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';

type VerifyEmailProps = {
    status?: string;
};

export default function VerifyEmail({ status }: VerifyEmailProps) {
    const { post, processing } = useForm({});

    const resend = () => {
        post(route('verification.send'));
    };

    return (
        <AuthPageShell>
            <Head title="Email Verification" />

            <Card className="w-full max-w-md shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={MailCheck} size="sm" />
                        Verify your email
                    </CardTitle>
                    <CardDescription>
                        Thanks for signing up. Please use the link in the email
                        we sent you. If you did not receive it, you can request
                        another.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {status === 'verification-link-sent' ? (
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            A new verification link has been sent to your email
                            address.
                        </p>
                    ) : null}
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 pt-4">
                    <Button
                        type="button"
                        onClick={resend}
                        disabled={processing}
                    >
                        Resend email
                    </Button>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={cn(
                            buttonVariants({ variant: 'ghost', size: 'sm' }),
                        )}
                    >
                        Log out
                    </Link>
                </CardFooter>
            </Card>
        </AuthPageShell>
    );
}
