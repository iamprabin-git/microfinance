import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/Modal';
import { HeadingIcon } from '@/components/ui/heading-icon';
import { useForm } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEventHandler } from 'react';

export default function DeleteUserForm() {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <div className="space-y-4">
            <Button
                type="button"
                variant="destructive"
                onClick={confirmUserDeletion}
            >
                Delete account
            </Button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                        <HeadingIcon icon={AlertTriangle} size="md" />
                        Delete your account?
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        This cannot be undone. Enter your password to confirm.
                    </p>

                    <div className="mt-6 grid gap-2">
                        <Label htmlFor="delete_password" className="sr-only">
                            Password
                        </Label>
                        <Input
                            id="delete_password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            placeholder="Password"
                            autoComplete="current-password"
                            aria-invalid={errors.password ? 'true' : 'false'}
                        />
                        {errors.password ? (
                            <p className="text-destructive text-sm">
                                {errors.password}
                            </p>
                        ) : null}
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={processing}
                        >
                            {processing ? 'Deleting…' : 'Delete account'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
