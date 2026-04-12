import { buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';
import type { MemberListRow } from '@/types/models';
import { Head, Link, usePage } from '@inertiajs/react';

type IndexProps = {
    members: MemberListRow[];
};

export default function Index({ members }: IndexProps) {
    const { companyPortal } = usePage().props;
    const canManage = companyPortal?.canManage ?? false;

    return (
        <AppLayout title="Members">
            <Head title="Members" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground max-w-xl text-sm">
                    Members belong to a savings group. Admins can add and edit
                    records; other company users can view the directory.
                </p>
                {canManage ? (
                    <Link
                        href={route('members.create')}
                        className={cn(buttonVariants())}
                    >
                        Add member
                    </Link>
                ) : null}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Directory</CardTitle>
                    <CardDescription>
                        All members across your organization&apos;s groups.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                    {members.length === 0 ? (
                        <p className="text-muted-foreground px-4 text-sm sm:px-0">
                            No members yet. Create a savings group in the admin
                            console, then add members here.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[36rem] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-3 font-medium">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Group
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Contact
                                        </th>
                                        {canManage ? (
                                            <th className="px-4 py-3 font-medium text-end">
                                                Actions
                                            </th>
                                        ) : null}
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((m) => (
                                        <tr
                                            key={m.id}
                                            className="border-b border-border/60 last:border-0"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {m.name}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3">
                                                {m.group.name}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3">
                                                {[m.email, m.phone]
                                                    .filter(Boolean)
                                                    .join(' · ') || '—'}
                                            </td>
                                            {canManage ? (
                                                <td className="px-4 py-3 text-end">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route(
                                                                'members.edit',
                                                                m.id,
                                                            )}
                                                            className={cn(
                                                                buttonVariants(
                                                                    {
                                                                        variant:
                                                                            'outline',
                                                                        size: 'sm',
                                                                    },
                                                                ),
                                                            )}
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            href={route(
                                                                'members.destroy',
                                                                m.id,
                                                            )}
                                                            method="delete"
                                                            as="button"
                                                            className={cn(
                                                                buttonVariants(
                                                                    {
                                                                        variant:
                                                                            'ghost',
                                                                        size: 'sm',
                                                                    },
                                                                ),
                                                                'text-destructive',
                                                            )}
                                                            onClick={(e) => {
                                                                if (
                                                                    !confirm(
                                                                        'Remove this member? Related savings and loans must be handled first.',
                                                                    )
                                                                ) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        >
                                                            Remove
                                                        </Link>
                                                    </div>
                                                </td>
                                            ) : null}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
