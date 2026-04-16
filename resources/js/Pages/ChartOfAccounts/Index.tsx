import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { HeadingIcon } from '@/components/ui/heading-icon';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';
import type { ChartOfAccountRow } from '@/types/models';
import { Head, Link, usePage } from '@inertiajs/react';
import { FolderTree } from 'lucide-react';

type IndexProps = {
    accounts: ChartOfAccountRow[];
    can_manage: boolean;
};

export default function Index({ accounts, can_manage }: IndexProps) {
    const { companyPortal } = usePage().props as any;
    const canManage = Boolean(can_manage ?? companyPortal?.canApproveRecords);

    return (
        <AppLayout title="Chart of accounts" titleIcon={FolderTree}>
            <Head title="Chart of accounts" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground max-w-xl text-sm">
                    Maintain the account codes your organization uses for
                    reporting and user assignment.
                </p>
                {canManage ? (
                    <Link
                        href={route('chart-of-accounts.create')}
                        className={cn(buttonVariants())}
                    >
                        Add account
                    </Link>
                ) : null}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={FolderTree} size="sm" />
                        Accounts
                    </CardTitle>
                    <CardDescription>
                        Active and inactive chart codes for your company.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                    {accounts.length === 0 ? (
                        <p className="text-muted-foreground px-4 text-sm sm:px-0">
                            No chart of account entries yet. Use &quot;Add
                            account&quot; to create your first one.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[40rem] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-3 font-medium">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Code
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Assigned users
                                        </th>
                                        {canManage ? (
                                            <th className="px-4 py-3 font-medium text-end">
                                                Actions
                                            </th>
                                        ) : null}
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.map((account) => (
                                        <tr
                                            key={account.id}
                                            className="border-b border-border/60 last:border-0"
                                        >
                                            <td className="px-4 py-3 tabular-nums capitalize">
                                                {account.type}
                                            </td>
                                            <td className="px-4 py-3 font-mono tabular-nums">
                                                {account.code}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {account.name}
                                                </div>
                                                <div className="text-muted-foreground mt-1 text-xs">
                                                    {account.description?.trim() ||
                                                        'No description'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        account.is_active
                                                            ? 'secondary'
                                                            : 'outline'
                                                    }
                                                >
                                                    {account.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 tabular-nums">
                                                {account.assigned_users_count}
                                            </td>
                                            {canManage ? (
                                                <td className="px-4 py-3 text-end">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route(
                                                                'chart-of-accounts.edit',
                                                                account.id,
                                                            )}
                                                            className={cn(
                                                                buttonVariants({
                                                                    variant:
                                                                        'outline',
                                                                    size: 'sm',
                                                                }),
                                                            )}
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            href={route(
                                                                'chart-of-accounts.destroy',
                                                                account.id,
                                                            )}
                                                            method="delete"
                                                            as="button"
                                                            className={cn(
                                                                buttonVariants({
                                                                    variant: 'ghost',
                                                                    size: 'sm',
                                                                }),
                                                                'text-destructive',
                                                            )}
                                                            onClick={(e) => {
                                                                if (
                                                                    !confirm(
                                                                        'Delete this chart of account?',
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
