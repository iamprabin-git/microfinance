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
import type { LoanListRow } from '@/types/models';
import { Head, Link, usePage } from '@inertiajs/react';

type IndexProps = {
    loans: LoanListRow[];
};

export default function Index({ loans }: IndexProps) {
    const { companyPortal } = usePage().props;
    const canManage = companyPortal?.canManage ?? false;

    return (
        <AppLayout title="Loans">
            <Head title="Loans" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground max-w-xl text-sm">
                    Track principal, repayments, and closure. Repayments are
                    logged on the loan detail page.
                </p>
                {canManage ? (
                    <Link
                        href={route('loans.create')}
                        className={cn(buttonVariants())}
                    >
                        New loan
                    </Link>
                ) : null}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Loans</CardTitle>
                    <CardDescription>
                        Group-scoped lending to members.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                    {loans.length === 0 ? (
                        <p className="text-muted-foreground px-4 text-sm sm:px-0">
                            No loans yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[44rem] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-3 font-medium">
                                            Member
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Group
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Principal
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Repaid
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Issued
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
                                    {loans.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="border-b border-border/60 last:border-0"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {row.member.name}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3">
                                                {row.group.name}
                                            </td>
                                            <td className="px-4 py-3 tabular-nums">
                                                {row.group.currency}{' '}
                                                {row.principal}
                                            </td>
                                            <td className="px-4 py-3 tabular-nums">
                                                {row.group.currency}{' '}
                                                {row.repaid}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3 tabular-nums">
                                                {row.issued_at}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        row.status === 'active'
                                                            ? 'secondary'
                                                            : 'default'
                                                    }
                                                >
                                                    {row.status}
                                                </Badge>
                                            </td>
                                            {canManage ? (
                                                <td className="px-4 py-3 text-end">
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        <Link
                                                            href={route(
                                                                'loans.edit',
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
                                                            Details
                                                        </Link>
                                                        <Link
                                                            href={route(
                                                                'loans.destroy',
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
                                                                        'Delete this loan and its repayments?',
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
