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
import { Package } from 'lucide-react';
import type { FormEventHandler } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        type: 'savings',
        code: '',
        name: '',
        description: '',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('products.store'));
    };

    return (
        <AppLayout title="New product" titleIcon={Package}>
            <Head title="New product" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={Package} size="sm" />
                        New product
                    </CardTitle>
                    <CardDescription>
                        Create a savings or loan product. Leave code empty to
                        auto-generate (example:{' '}
                        <span className="font-mono">S/SAV/01</span>).
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
                                <option value="savings">Savings</option>
                                <option value="loan">Loan</option>
                            </select>
                            {errors.type ? (
                                <p className="text-destructive text-sm">
                                    {errors.type}
                                </p>
                            ) : null}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="code">Code (optional)</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value)
                                }
                                placeholder={
                                    data.type === 'loan'
                                        ? 'L/LON/01'
                                        : 'S/SAV/01'
                                }
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
                            Active product
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
                            href={route('products.index')}
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

