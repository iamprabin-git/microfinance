import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
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
    const photoUrl = user?.profile_photo_url ?? null;
    const initials = useMemo(() => {
        const name = (user?.name ?? '').trim();
        if (!name) return 'U';
        const parts = name.split(/\s+/).filter(Boolean);
        const a = parts[0]?.[0] ?? 'U';
        const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
        return (a + b).toUpperCase();
    }, [user?.name]);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user?.name ?? '',
            email: user?.email ?? '',
            profile_image: null as File | null,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'), { forceFormData: true });
    };

    if (!user) {
        return null;
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-2">
                <Label>Profile photo</Label>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative size-16 overflow-hidden rounded-full border border-border/60 bg-muted/40">
                        {photoUrl ? (
                            <img
                                src={photoUrl}
                                alt={user.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-foreground/80">
                                {initials}
                            </div>
                        )}
                    </div>
                    <div className="min-w-[14rem] flex-1 space-y-1.5">
                        <Input
                            id="profile_image"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setData(
                                    'profile_image',
                                    e.target.files?.[0] ?? null,
                                )
                            }
                            aria-invalid={errors.profile_image ? 'true' : 'false'}
                        />
                        <p className="text-muted-foreground text-xs">
                            PNG/JPG up to 4MB.
                        </p>
                        {errors.profile_image ? (
                            <p className="text-destructive text-sm">
                                {errors.profile_image}
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>

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
