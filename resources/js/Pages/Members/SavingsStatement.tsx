import { buttonVariants } from '@/components/ui/button';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { PiggyBank } from 'lucide-react';

type Props = {
    company: { name: string; currency: string } | null;
    member: {
        id: number;
        name: string;
        member_number: number | null;
        savings_account_number: string | null;
    };
    rows: {
        date: string | null;
        type: string;
        reference: string | null;
        notes: string | null;
        deposit: string | null;
        withdraw: string | null;
        balance: string;
    }[];
    total: string;
};

export default function SavingsStatement({ company, member, rows, total }: Props) {
    const currency = company?.currency ?? 'NPR';

    return (
        <AppLayout title="Savings statement" titleIcon={PiggyBank} hidePrint={false}>
            <Head title="Savings statement" />

            <div className="mb-4 flex justify-end gap-2 print:hidden">
                <Link
                    href={route('members.edit', member.id)}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                    Back to member
                </Link>
            </div>

            <header className="hidden border-b border-border/60 pb-3 print:block">
                <div className="text-center">
                    <h1 className="text-xl font-semibold">
                        {company?.name ?? '—'}
                    </h1>
                    <h3 className="text-muted-foreground mt-1 text-sm font-medium">
                        Savings statement
                    </h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                        Savings A/c: {member.savings_account_number ?? '—'} · Member:{' '}
                        {member.name} · Currency: {currency}
                    </p>
                </div>
            </header>

            <div className="overflow-hidden rounded-lg border border-border/60">
                <table className="w-full min-w-[40rem] text-sm">
                    <thead className="bg-muted/20">
                        <tr className="text-left">
                            <th className="px-4 py-2 font-semibold">Date</th>
                            <th className="px-4 py-2 font-semibold">Type</th>
                            <th className="px-4 py-2 font-semibold">Reference</th>
                            <th className="px-4 py-2 text-right font-semibold">
                                Deposit
                            </th>
                            <th className="px-4 py-2 text-right font-semibold">
                                Withdraw
                            </th>
                            <th className="px-4 py-2 text-right font-semibold">
                                Balance
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="text-muted-foreground px-4 py-6 text-center"
                                >
                                    No approved paid savings yet.
                                </td>
                            </tr>
                        ) : (
                            rows.map((r, i) => (
                                <tr
                                    key={`${r.date}-${r.type}-${i}`}
                                    className="border-t border-border/40"
                                >
                                    <td className="px-4 py-2 text-muted-foreground tabular-nums">
                                        {r.date ?? '—'}
                                    </td>
                                    <td className="px-4 py-2 capitalize">
                                        {r.type}
                                    </td>
                                    <td className="px-4 py-2 text-muted-foreground">
                                        {r.reference ?? '—'}
                                    </td>
                                    <td className="px-4 py-2 text-right tabular-nums">
                                        {r.deposit ? `${currency} ${r.deposit}` : '—'}
                                    </td>
                                    <td className="px-4 py-2 text-right tabular-nums">
                                        {r.withdraw ? `${currency} ${r.withdraw}` : '—'}
                                    </td>
                                    <td className="px-4 py-2 text-right tabular-nums font-semibold">
                                        {currency} {r.balance}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="border-t border-border/60 font-semibold">
                            <td className="px-4 py-3" colSpan={5}>
                                Closing balance
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums">
                                {currency} {total}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </AppLayout>
    );
}

