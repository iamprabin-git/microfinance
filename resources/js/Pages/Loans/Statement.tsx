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
import { Landmark } from 'lucide-react';

type LoanStatementProps = {
    company: { name: string; currency: string } | null;
    loan: {
        id: number;
        loan_account_number: string | null;
        issued_at: string | null;
        due_date: string | null;
        principal: string;
        status: string;
        company_approval_status: string;
        member: {
            id: number | null;
            name: string;
            member_number: number | null;
            savings_account_number: string | null;
        };
    };
    transactions: {
        date: string | null;
        type: string;
        reference: string | null;
        debit: string | null;
        credit: string | null;
        notes: string | null;
    }[];
};

export default function Statement({ company, loan, transactions }: LoanStatementProps) {
    const currency = company?.currency ?? 'NPR';

    return (
        <AppLayout title="Loan statement" titleIcon={Landmark} hidePrint={false}>
            <Head title="Loan statement" />

            <div className="mb-4 flex justify-end gap-2 print:hidden">
                <Link
                    href={route('loans.edit', loan.id)}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                    Back to loan
                </Link>
            </div>

            <header className="hidden border-b border-border/60 pb-3 print:block">
                <div className="text-center">
                    <h1 className="text-xl font-semibold">
                        {company?.name ?? '—'}
                    </h1>
                    <h3 className="text-muted-foreground mt-1 text-sm font-medium">
                        Loan statement
                    </h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                        Loan A/c: {loan.loan_account_number ?? '—'} · Member:{' '}
                        {loan.member.name} · Currency: {currency}
                    </p>
                </div>
            </header>

            <Card className="mb-6 print:hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={Landmark} size="sm" />
                        Loan
                    </CardTitle>
                    <CardDescription>
                        Loan A/c {loan.loan_account_number ?? '—'} · Member{' '}
                        {loan.member.name}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Issued</span>
                        <span className="tabular-nums">{loan.issued_at ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Principal</span>
                        <span className="tabular-nums">
                            {currency} {loan.principal}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <div className="overflow-hidden rounded-lg border border-border/60">
                <table className="w-full min-w-[44rem] text-sm">
                    <thead className="bg-muted/20">
                        <tr className="text-left">
                            <th className="px-4 py-2 font-semibold">Date</th>
                            <th className="px-4 py-2 font-semibold">Type</th>
                            <th className="px-4 py-2 font-semibold">Reference</th>
                            <th className="px-4 py-2 text-right font-semibold">
                                Debit
                            </th>
                            <th className="px-4 py-2 text-right font-semibold">
                                Credit
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((t, i) => (
                            <tr
                                key={`${t.type}-${t.date}-${i}`}
                                className="border-t border-border/40"
                            >
                                <td className="px-4 py-2 text-muted-foreground tabular-nums">
                                    {t.date ?? '—'}
                                </td>
                                <td className="px-4 py-2">{t.type}</td>
                                <td className="px-4 py-2 text-muted-foreground">
                                    {t.reference ?? '—'}
                                </td>
                                <td className="px-4 py-2 text-right tabular-nums">
                                    {t.debit ? `${currency} ${t.debit}` : '—'}
                                </td>
                                <td className="px-4 py-2 text-right tabular-nums">
                                    {t.credit ? `${currency} ${t.credit}` : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}

