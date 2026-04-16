import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { Head, Link } from '@inertiajs/react';
import { NotebookPen, Plus } from 'lucide-react';

type VoucherRow = {
    id: number;
    voucher_date: string | null;
    voucher_number: string | null;
    title: string;
    description: string | null;
    dr_accounts: { id: number; label: string; amount: string }[];
    cr_accounts: { id: number; label: string; amount: string }[];
    dr_amount: string;
    cr_amount: string;
    remarks: string | null;
};

type Props = {
    vouchers: VoucherRow[];
    can_create: boolean;
};

export default function Index({ vouchers, can_create }: Props) {
    return (
        <AppLayout title="Journal entries" titleIcon={NotebookPen} hidePrint={false}>
            <Head title="Journal entries" />

            <div className="mx-auto max-w-6xl space-y-6">
                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <HeadingIcon icon={NotebookPen} size="sm" />
                                Journal entries
                            </CardTitle>
                            <CardDescription>
                                Voucher-style journal list (Title, Description, Voucher
                                no., Dr/Cr, Remarks).
                            </CardDescription>
                        </div>
                        {can_create ? (
                            <Link
                                href={route('journal-vouchers.create')}
                                className={cn(buttonVariants())}
                            >
                                <Plus className="mr-2 size-4" />
                                New entry
                            </Link>
                        ) : null}
                    </CardHeader>
                    <CardContent className="px-0 sm:px-6">
                        {vouchers.length === 0 ? (
                            <p className="text-muted-foreground px-4 text-sm sm:px-0">
                                No journal entries yet.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[64rem] text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="px-4 py-3 font-medium">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Voucher #
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Title
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Accounts
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Amounts
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Description
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Remarks
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vouchers.map((v) => (
                                            <tr
                                                key={v.id}
                                                className="border-b border-border/60 last:border-0"
                                            >
                                                <td className="text-muted-foreground px-4 py-3 tabular-nums">
                                                    {v.voucher_date ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {v.voucher_number ? (
                                                        <Badge variant="secondary">
                                                            {v.voucher_number}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {v.title}
                                                    {v.voucher_number ? (
                                                        <div className="mt-1 text-xs text-muted-foreground sm:hidden">
                                                            Voucher #{v.voucher_number}
                                                        </div>
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline">
                                                                    {v.dr_accounts.length >
                                                                    1
                                                                        ? `Dr (${v.dr_accounts.length})`
                                                                        : 'Dr'}
                                                                </Badge>
                                                            </div>
                                                            {v.dr_accounts.length ===
                                                            0 ? (
                                                                <p className="text-muted-foreground text-xs">
                                                                    —
                                                                </p>
                                                            ) : (
                                                                <ul className="space-y-1">
                                                                    {v.dr_accounts.map(
                                                                        (a) => (
                                                                            <li
                                                                                key={`dr-${a.id}`}
                                                                                className="truncate text-xs font-medium text-foreground"
                                                                            >
                                                                                {a.label}
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline">
                                                                    {v.cr_accounts.length >
                                                                    1
                                                                        ? `Cr (${v.cr_accounts.length})`
                                                                        : 'Cr'}
                                                                </Badge>
                                                            </div>
                                                            {v.cr_accounts.length ===
                                                            0 ? (
                                                                <p className="text-muted-foreground text-xs">
                                                                    —
                                                                </p>
                                                            ) : (
                                                                <ul className="space-y-1">
                                                                    {v.cr_accounts.map(
                                                                        (a) => (
                                                                            <li
                                                                                key={`cr-${a.id}`}
                                                                                className="truncate text-xs font-medium text-foreground"
                                                                            >
                                                                                {a.label}
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="grid gap-3 text-end sm:grid-cols-2">
                                                        <div className="space-y-1.5">
                                                            <p className="text-[11px] font-medium text-muted-foreground">
                                                                {v.dr_accounts.length >
                                                                1
                                                                    ? `Dr (${v.dr_accounts.length})`
                                                                    : 'Dr'}
                                                            </p>
                                                            {v.dr_accounts.length ===
                                                            0 ? (
                                                                <p className="text-muted-foreground text-xs">
                                                                    —
                                                                </p>
                                                            ) : (
                                                                <ul className="space-y-1">
                                                                    {v.dr_accounts.map(
                                                                        (a) => (
                                                                            <li
                                                                                key={`dra-${a.id}`}
                                                                                className="tabular-nums text-xs font-semibold text-foreground"
                                                                            >
                                                                                {a.amount}
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <p className="text-[11px] font-medium text-muted-foreground">
                                                                {v.cr_accounts.length >
                                                                1
                                                                    ? `Cr (${v.cr_accounts.length})`
                                                                    : 'Cr'}
                                                            </p>
                                                            {v.cr_accounts.length ===
                                                            0 ? (
                                                                <p className="text-muted-foreground text-xs">
                                                                    —
                                                                </p>
                                                            ) : (
                                                                <ul className="space-y-1">
                                                                    {v.cr_accounts.map(
                                                                        (a) => (
                                                                            <li
                                                                                key={`cra-${a.id}`}
                                                                                className="tabular-nums text-xs font-semibold text-foreground"
                                                                            >
                                                                                {a.amount}
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-muted-foreground px-4 py-3">
                                                    {v.description ?? '—'}
                                                </td>
                                                <td className="text-muted-foreground px-4 py-3">
                                                    {v.remarks ?? '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="mt-4 px-4 sm:px-0">
                            <Link
                                href={route('financial-statements.index')}
                                className={cn(
                                    buttonVariants({ variant: 'outline', size: 'sm' }),
                                )}
                            >
                                View statements
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

