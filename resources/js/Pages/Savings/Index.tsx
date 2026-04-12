import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';
import type { SavingListRow } from '@/types/models';
import { Head, Link, usePage } from '@inertiajs/react';

type IndexProps = {
    savings: SavingListRow[];
};

function statusVariant(
    s: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (s === 'paid') return 'default';
    if (s === 'pending') return 'secondary';
    return 'outline';
}

export default function Index({ savings }: IndexProps) {
    const { companyPortal } = usePage().props;
    const canManage = companyPortal?.canManage ?? false;

    return (
        <AppLayout title="Savings">
            <Head title="Savings" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground max-w-xl text-sm">
                    Monthly contribution records per member. Amounts use each
                    group&apos;s currency.
                </p>
                {canManage ? (
                    <Link
                        href={route('savings.create')}
                        className={cn(buttonVariants())}
                    >
                        Add record
                    </Link>
                ) : null}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Monthly savings</CardTitle>
                    <CardDescription>
                        Sorted by period (newest first).
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                    {savings.length === 0 ? (
                        <p className="text-muted-foreground px-4 text-sm sm:px-0">
                            No saving records yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[40rem] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-3 font-medium">
                                            Period
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Member
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Group
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        {canManage ? (
                                            <th className="px-4 py-3 font-medium text-end">
                                                Actions
                                            </th>
                                        ) : null}
                                    </tr>
                                </thead>
                                <tbody>
                                    {savings.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="border-b border-border/60 last:border-0"
                                        >
                                            <td className="px-4 py-3 tabular-nums">
                                                {row.period.slice(0, 7)}
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                {row.member.name}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3">
                                                {row.group.name}
                                            </td>
                                            <td className="px-4 py-3 tabular-nums">
                                                {row.group.currency}{' '}
                                                {row.amount}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={statusVariant(
                                                        row.status,
                                                    )}
                                                >
                                                    {row.status}
                                                </Badge>
                                            </td>
                                            {canManage ? (
                                                <td className="px-4 py-3 text-end">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route(
                                                                'savings.edit',
                                                                row.id,
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
                                                                'savings.destroy',
                                                                row.id,
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
                                                                        'Delete this record?',
                                                                    )
                                                                ) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        >
                                                            Delete
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
