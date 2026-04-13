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
import { UserPen } from 'lucide-react';
import type { FormEventHandler } from 'react';

type MemberEdit = {
    id: number;
    member_number: number | null;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    profile_photo_url: string | null;
};

type EditProps = {
    member: MemberEdit;
};

export default function Edit({ member }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: member.name,
        email: member.email ?? '',
        phone: member.phone ?? '',
        address: member.address ?? '',
        profile_image: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('members.update', member.id));
    };

    return (
        <AppLayout title="Edit member" titleIcon={UserPen}>
            <Head title="Edit member" />

            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={UserPen} size="sm" />
                        Edit member
                    </CardTitle>
                    <CardDescription>Update this member&apos;s profile.</CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Member #</Label>
                            <p className="bg-muted/50 font-mono text-muted-foreground rounded-lg border px-3 py-2 text-sm tabular-nums">
                                {member.member_number ?? '—'}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Auto-incrementing number for this organization (1,
                                2, 3…).
                            </p>
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
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                            />
                            {errors.email ? (
                                <p className="text-destructive text-sm">
                                    {errors.email}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                            />
                            {errors.phone ? (
                                <p className="text-destructive text-sm">
                                    {errors.phone}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <textarea
                                id="address"
                                className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex min-h-[5rem] w-full rounded-lg border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                value={data.address}
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                                rows={4}
                            />
                            {errors.address ? (
                                <p className="text-destructive text-sm">
                                    {errors.address}
                                </p>
                            ) : null}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="profile_image">Profile image</Label>
                            {member.profile_photo_url ? (
                                <img
                                    src={member.profile_photo_url}
                                    alt={`${member.name} profile`}
                                    className="border-border size-16 rounded-lg border object-cover"
                                />
                            ) : null}
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
                            />
                            {errors.profile_image ? (
                                <p className="text-destructive text-sm">
                                    {errors.profile_image}
                                </p>
                            ) : null}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-between gap-3 border-t bg-muted/30">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save'}
                        </Button>
                        <Link
                            href={route('members.index')}
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
