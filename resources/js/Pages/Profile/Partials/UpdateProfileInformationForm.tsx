import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useForm, usePage } from '@inertiajs/react';
import type { FormEventHandler } from 'react';

type UpdateProfileInformationFormProps = {
    mustVerifyEmail?: boolean;
    status?: string;
};

export default function UpdateProfileInformationForm({
    mustVerifyEmail,
    status,
}: UpdateProfileInformationFormProps) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user?.name ?? '',
            email: user?.email ?? '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    if (!user) {
        return null;
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={data.name}
                    autoComplete="name"
                    autoFocus
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name ? (
                    <p className="text-destructive text-sm">{errors.name}</p>
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
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email ? (
                    <p className="text-destructive text-sm">{errors.email}</p>
                ) : null}
            </div>

            {mustVerifyEmail && user.email_verified_at == null ? (
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                    <p className="text-foreground">
                        Your email address is unverified.{' '}
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="text-primary font-medium underline-offset-4 hover:underline"
                        >
                            Resend verification email
                        </Link>
                    </p>
                    {status === 'verification-link-sent' ? (
                        <p className="mt-2 font-medium text-green-600 dark:text-green-400">
                            A new verification link has been sent.
                        </p>
                    ) : null}
                </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-4">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving…' : 'Save'}
                </Button>
                {recentlySuccessful ? (
                    <p className="text-muted-foreground text-sm">Saved.</p>
                ) : null}
            </div>
        </form>
    );
}
