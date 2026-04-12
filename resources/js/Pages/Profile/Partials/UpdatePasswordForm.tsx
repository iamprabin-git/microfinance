import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import type { FormEventHandler } from 'react';

export default function UpdatePasswordForm() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errs.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <form onSubmit={updatePassword} className="space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="current_password">Current password</Label>
                <Input
                    id="current_password"
                    ref={currentPasswordInput}
                    value={data.current_password}
                    onChange={(e) =>
                        setData('current_password', e.target.value)
                    }
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={
                        errors.current_password ? 'true' : 'false'
                    }
                />
                {errors.current_password ? (
                    <p className="text-destructive text-sm">
                        {errors.current_password}
                    </p>
                ) : null}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <Input
                    id="password"
                    ref={passwordInput}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={errors.password ? 'true' : 'false'}
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
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={
                        errors.password_confirmation ? 'true' : 'false'
                    }
                />
                {errors.password_confirmation ? (
                    <p className="text-destructive text-sm">
                        {errors.password_confirmation}
                    </p>
                ) : null}
            </div>

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
