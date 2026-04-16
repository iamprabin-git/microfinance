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
import { Head, Link } from '@inertiajs/react';
import { Receipt } from 'lucide-react';

type Row = {
    id: number;
    type: string;
    amount: string;
    occurred_at: string | null;
    status: string;
    company_approval_status: string;
    reference: string | null;
    notes: string | null;
    currency: string;
    member: {
        id: number | null;
        name: string;
        member_number: number | null;
        savings_account_number: string | null;
    };
};

type Props = {
    transactions: Row[];
    can_post: boolean;
};

export default function Index({ transactions, can_post }: Props) {
    return (
        <AppLayout title="Savings ledger" titleIcon={Receipt} hidePrint={false}>
            <Head title="Savings ledger" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground max-w-xl text-sm">
                    Deposit and withdraw transactions. Company approval controls
                    whether totals affect statements.
                </p>
                {can_post ? (
                    <Link
                        href={route('savings-transactions.create')}
                        className={cn(buttonVariants())}
                    >
                        New transaction
                    </Link>
                ) : null}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={Receipt} size="sm" />
                        Transactions
                    </CardTitle>
                    <CardDescription>Newest first.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                    {transactions.length === 0 ? (
                        <p className="text-muted-foreground px-4 text-sm sm:px-0">
                            No savings ledger transactions yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[56rem] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-3 font-medium">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Member
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Savings A/c
                                        </th>
                                        <th className="px-4 py-3 font-medium text-end">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Company
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Reference
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((t) => (
                                        <tr
                                            key={t.id}
                                            className="border-b border-border/60 last:border-0"
                                        >
                                            <td className="text-muted-foreground px-4 py-3 tabular-nums">
                                                {t.occurred_at ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 font-medium capitalize">
                                                {t.type}
                                            </td>
                                            <td className="px-4 py-3">
                                                {t.member.name}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3 font-mono text-xs tabular-nums">
                                                {t.member.savings_account_number ??
                                                    '—'}
                                            </td>
                                            <td className="px-4 py-3 text-end tabular-nums">
                                                {t.currency}{' '}
                                                {t.type === 'withdraw' ? '−' : ''}
                                                {t.amount}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        t.company_approval_status ===
                                                        'approved'
                                                            ? 'secondary'
                                                            : 'outline'
                                                    }
                                                >
                                                    {t.company_approval_status.replace(
                                                        /_/g,
                                                        ' ',
                                                    )}
                                                </Badge>
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3">
                                                {t.reference ?? '—'}
                                            </td>
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

