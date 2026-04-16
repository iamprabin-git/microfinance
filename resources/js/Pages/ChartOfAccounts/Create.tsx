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
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FolderTree } from 'lucide-react';
import type { FormEventHandler } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        type: 'asset',
        code: '',
        name: '',
        description: '',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('chart-of-accounts.store'));
    };

    return (
        <AppLayout title="New chart of account" titleIcon={FolderTree}>
            <Head title="New chart of account" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={FolderTree} size="sm" />
                        New chart of account
                    </CardTitle>
                    <CardDescription>
                        Create an account code for your organization&apos;s
                        internal reporting.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <select
                                id="type"
                                value={data.type}
                                onChange={(e) =>
                                    setData('type', e.target.value)
                                }
                                className="border-input bg-background w-full rounded-lg border px-3 py-2 text-sm"
                                required
                            >
                                <option value="asset">Asset</option>
                                <option value="liability">Liability</option>
                                <option value="capital">Capital</option>
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                            {errors.type ? (
                                <p className="text-destructive text-sm">
                                    {errors.type}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="code">Code</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value)
                                }
                                required
                            />
                            {errors.code ? (
                                <p className="text-destructive text-sm">
                                    {errors.code}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                required
                            />
                            {errors.name ? (
                                <p className="text-destructive text-sm">
                                    {errors.name}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                rows={4}
                                className="border-input bg-background min-h-[5rem] w-full rounded-lg border px-3 py-2 text-sm"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                            />
                            {errors.description ? (
                                <p className="text-destructive text-sm">
                                    {errors.description}
                                </p>
                            ) : null}
                        </div>
                        <label className="flex items-center gap-3 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) =>
                                    setData('is_active', e.target.checked)
                                }
                                className="border-input size-4 rounded border"
                            />
                            Active account
                        </label>
                        {errors.is_active ? (
                            <p className="text-destructive text-sm">
                                {errors.is_active}
                            </p>
                        ) : null}
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-between gap-3 border-t bg-muted/30">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save'}
                        </Button>
                        <Link
                            href={route('chart-of-accounts.index')}
                            className="text-muted-foreground text-sm underline-offset-4 hover:underline"
                        >
                            Cancel
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </AppLayout>
    );
}
