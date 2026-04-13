import { buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { HeadingIcon } from '@/components/ui/heading-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/Layouts/AppLayout';
import { formatBsFromAdYmd, formatBsIsoFromAdYmd } from '@/lib/nepaliDate';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { FileSpreadsheet } from 'lucide-react';

type TrialBalanceRow = {
    code: string;
    name: string;
    debit: string | null;
    credit: string | null;
};

type TrialBalancePayload = {
    rows: TrialBalanceRow[];
    total_debit: string;
    total_credit: string;
    as_of: string;
};

type BalanceSheetPayload = {
    assets: { label: string; amount: string }[];
    liabilities: { label: string; amount: string }[];
    equity: { label: string; amount: string }[];
    as_of: string;
};

type ProfitLossPayload = {
    lines: { label: string; amount: string; kind: string }[];
    net_change: string;
    period_from: string;
    period_to: string;
};

type CashFlowPayload = {
    lines: { label: string; amount: string }[];
    opening: string;
    closing: string;
    period_from: string;
    period_to: string;
};

type SavingsRegisterRow = {
    member_name: string;
    member_number: string | null;
    period: string | null;
    paid_at: string | null;
    amount: string;
    status: string;
    company_approval: string;
    included_in_total: boolean;
};

type SavingsRegisterPayload = {
    rows: SavingsRegisterRow[];
    total: string;
    total_caption: string;
    footnote: string;
    period_from: string;
    period_to: string;
};

type LoansRegisterRow = {
    member_name: string;
    member_number: string | null;
    issued_at: string | null;
    due_date: string | null;
    principal: string;
    repaid_cumulative: string;
    repaid_in_period: string;
    outstanding: string;
    status: string;
};

type LoansRegisterPayload = {
    rows: LoansRegisterRow[];
    period_from: string;
    period_to: string;
};

type ReportKey =
    | 'trial-balance'
    | 'profit-and-loss'
    | 'balance-sheet'
    | 'cash-flow'
    | 'savings-register'
    | 'loans-register';

type IndexProps = {
    report: ReportKey;
    as_of: string;
    from: string;
    to: string;
    currency: string;
    disclaimer: string;
    trial_balance: TrialBalancePayload | null;
    balance_sheet: BalanceSheetPayload | null;
    profit_and_loss: ProfitLossPayload | null;
    cash_flow: CashFlowPayload | null;
    savings_register: SavingsRegisterPayload | null;
    loans_register: LoansRegisterPayload | null;
};

function reportHref(
    report: ReportKey,
    dates: { as_of: string; from: string; to: string },
): string {
    const base = { report, ...dates };
    return route('financial-statements.index', base);
}

/** Bikram Sambat (Nepali calendar) alongside an AD YYYY-MM-DD value. */
function BsAfterAd({ adYmd }: { adYmd: string }) {
    const np = formatBsFromAdYmd(adYmd);
    const iso = formatBsIsoFromAdYmd(adYmd);
    if (!np) {
        return null;
    }

    return (
        <span
            className="text-muted-foreground font-normal"
            title={iso ? `BS ${iso}` : undefined}
        >
            {' '}
            (वि.सं. {np})
        </span>
    );
}

export default function Index({
    report,
    as_of,
    from,
    to,
    currency,
    disclaimer,
    trial_balance,
    balance_sheet,
    profit_and_loss,
    cash_flow,
    savings_register,
    loans_register,
}: IndexProps) {
    const dates = { as_of, from, to };
    const asOfBsHint = formatBsFromAdYmd(as_of);
    const fromBsHint = formatBsFromAdYmd(from);
    const toBsHint = formatBsFromAdYmd(to);

    const tabs: { key: ReportKey; label: string }[] = [
        { key: 'trial-balance', label: 'Trial balance' },
        { key: 'profit-and-loss', label: 'P&L' },
        { key: 'balance-sheet', label: 'Balance sheet' },
        { key: 'cash-flow', label: 'Cash flow' },
        { key: 'savings-register', label: 'Savings list' },
        { key: 'loans-register', label: 'Loan list' },
    ];

    return (
        <AppLayout
            title="Financial statements"
            titleIcon={FileSpreadsheet}
            hidePrint={false}
        >
            <Head title="Financial statements" />

            <p className="text-muted-foreground mb-4 max-w-2xl text-sm print:hidden">
                Management views built from approved loans, repayments, and paid
                savings. End users see only activity linked to their member email.
            </p>

            <div className="mb-6 flex flex-wrap gap-2 print:hidden">
                {tabs.map((t) => (
                    <Link
                        key={t.key}
                        href={reportHref(t.key, dates)}
                        preserveScroll
                        className={cn(
                            buttonVariants({
                                variant:
                                    report === t.key ? 'secondary' : 'outline',
                                size: 'sm',
                            }),
                        )}
                    >
                        {t.label}
                    </Link>
                ))}
            </div>

            <form
                key={`${report}-${as_of}-${from}-${to}`}
                method="get"
                action={route('financial-statements.index')}
                className="mb-6 flex flex-wrap items-end gap-4 print:hidden"
            >
                <input type="hidden" name="report" value={report} />
                {(report === 'trial-balance' || report === 'balance-sheet') && (
                    <div className="space-y-1.5">
                        <Label htmlFor="as_of">As of</Label>
                        <Input
                            id="as_of"
                            type="date"
                            name="as_of"
                            defaultValue={as_of}
                            className="w-[11rem]"
                        />
                        {asOfBsHint ? (
                            <p className="text-muted-foreground max-w-[14rem] text-xs">
                                वि.सं. {asOfBsHint}
                            </p>
                        ) : null}
                    </div>
                )}
                {(report === 'profit-and-loss' ||
                    report === 'cash-flow' ||
                    report === 'savings-register' ||
                    report === 'loans-register') && (
                    <>
                        <div className="space-y-1.5">
                            <Label htmlFor="from">From</Label>
                            <Input
                                id="from"
                                type="date"
                                name="from"
                                defaultValue={from}
                                className="w-[11rem]"
                            />
                            {fromBsHint ? (
                                <p className="text-muted-foreground max-w-[14rem] text-xs">
                                    वि.सं. {fromBsHint}
                                </p>
                            ) : null}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="to">To</Label>
                            <Input
                                id="to"
                                type="date"
                                name="to"
                                defaultValue={to}
                                className="w-[11rem]"
                            />
                            {toBsHint ? (
                                <p className="text-muted-foreground max-w-[14rem] text-xs">
                                    वि.सं. {toBsHint}
                                </p>
                            ) : null}
                        </div>
                    </>
                )}
                <button type="submit" className={cn(buttonVariants())}>
                    Apply dates
                </button>
            </form>

            <p className="text-muted-foreground mb-6 text-xs">{disclaimer}</p>

            {trial_balance ? (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HeadingIcon icon={FileSpreadsheet} size="sm" />
                            Trial balance
                        </CardTitle>
                        <CardDescription>
                            As of {trial_balance.as_of}
                            <BsAfterAd adYmd={trial_balance.as_of} /> · {currency}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 sm:px-6">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[36rem] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-2 font-medium">
                                            Code
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            Account
                                        </th>
                                        <th className="px-4 py-2 text-end font-medium">
                                            Debit
                                        </th>
                                        <th className="px-4 py-2 text-end font-medium">
                                            Credit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trial_balance.rows.map((row) => (
                                        <tr
                                            key={row.code + row.name}
                                            className="border-b border-border/60"
                                        >
                                            <td className="text-muted-foreground px-4 py-2">
                                                {row.code}
                                            </td>
                                            <td className="px-4 py-2">{row.name}</td>
                                            <td className="px-4 py-2 text-end tabular-nums">
                                                {row.debit ?? '—'}
                                            </td>
                                            <td className="px-4 py-2 text-end tabular-nums">
                                                {row.credit ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="font-medium">
                                        <td className="px-4 py-3" colSpan={2}>
                                            Totals
                                        </td>
                                        <td className="px-4 py-3 text-end tabular-nums">
                                            {trial_balance.total_debit}
                                        </td>
                                        <td className="px-4 py-3 text-end tabular-nums">
                                            {trial_balance.total_credit}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {balance_sheet ? (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Balance sheet</CardTitle>
                        <CardDescription>
                            As of {balance_sheet.as_of}
                            <BsAfterAd adYmd={balance_sheet.as_of} /> · {currency}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 px-0 sm:px-6">
                        <section>
                            <h3 className="mb-2 text-sm font-semibold">Assets</h3>
                            <ul className="space-y-1 text-sm">
                                {balance_sheet.assets.map((row) => (
                                    <li
                                        key={row.label}
                                        className="flex justify-between gap-4 border-b border-border/40 py-1.5"
                                    >
                                        <span>{row.label}</span>
                                        <span className="tabular-nums">
                                            {row.amount}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                        <section>
                            <h3 className="mb-2 text-sm font-semibold">
                                Liabilities
                            </h3>
                            <ul className="space-y-1 text-sm">
                                {balance_sheet.liabilities.map((row) => (
                                    <li
                                        key={row.label}
                                        className="flex justify-between gap-4 border-b border-border/40 py-1.5"
                                    >
                                        <span>{row.label}</span>
                                        <span className="tabular-nums">
                                            {row.amount}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                        <section>
                            <h3 className="mb-2 text-sm font-semibold">Equity</h3>
                            <ul className="space-y-1 text-sm">
                                {balance_sheet.equity.map((row) => (
                                    <li
                                        key={row.label}
                                        className="flex justify-between gap-4 border-b border-border/40 py-1.5"
                                    >
                                        <span>{row.label}</span>
                                        <span className="tabular-nums">
                                            {row.amount}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </CardContent>
                </Card>
            ) : null}

            {profit_and_loss ? (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Profit &amp; loss (activity)</CardTitle>
                        <CardDescription>
                            From {profit_and_loss.period_from}
                            <BsAfterAd adYmd={profit_and_loss.period_from} /> to{' '}
                            {profit_and_loss.period_to}
                            <BsAfterAd adYmd={profit_and_loss.period_to} /> ·{' '}
                            {currency}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 sm:px-6">
                        <ul className="space-y-2 text-sm">
                            {profit_and_loss.lines.map((line) => (
                                <li
                                    key={line.label}
                                    className="flex justify-between gap-4 border-b border-border/40 py-2"
                                >
                                    <span>{line.label}</span>
                                    <span
                                        className={cn(
                                            'tabular-nums',
                                            line.kind === 'outflow' &&
                                                'text-destructive',
                                        )}
                                    >
                                        {line.kind === 'outflow' ? '−' : ''}
                                        {line.amount}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 flex justify-between border-t pt-3 text-sm font-semibold">
                            <span>Net (cash-style)</span>
                            <span className="tabular-nums">
                                {profit_and_loss.net_change}
                            </span>
                        </p>
                    </CardContent>
                </Card>
            ) : null}

            {savings_register ? (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Savings register (individual)</CardTitle>
                        <CardDescription>
                            Paid savings use the paid date; pending contributions use
                            the contribution month so new activity appears before a pay
                            date exists.{' '}
                            {savings_register.period_from}
                            <BsAfterAd adYmd={savings_register.period_from} /> –{' '}
                            {savings_register.period_to}
                            <BsAfterAd adYmd={savings_register.period_to} /> ·{' '}
                            {currency}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 sm:px-6">
                        {savings_register.rows.length === 0 ? (
                            <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                                No savings lines in this date range.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-muted-foreground px-4 text-xs sm:px-0">
                                    {savings_register.footnote}
                                </p>
                                <div className="overflow-x-auto">
                                <table className="w-full min-w-[52rem] text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="px-4 py-2 font-medium">
                                                Member
                                            </th>
                                            <th className="px-4 py-2 font-medium">
                                                No.
                                            </th>
                                            <th className="px-4 py-2 font-medium">
                                                Period
                                            </th>
                                            <th className="px-4 py-2 font-medium">
                                                Paid on
                                            </th>
                                            <th className="px-4 py-2 font-medium">
                                                Status
                                            </th>
                                            <th className="px-4 py-2 font-medium">
                                                Company
                                            </th>
                                            <th className="px-4 py-2 font-medium">
                                                In total
                                            </th>
                                            <th className="px-4 py-2 text-end font-medium">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {savings_register.rows.map((row, i) => (
                                            <tr
                                                key={`${row.member_name}-${row.paid_at}-${row.period}-${row.status}-${row.company_approval}-${i}`}
                                                className="border-b border-border/60"
                                            >
                                                <td className="px-4 py-2">
                                                    {row.member_name}
                                                </td>
                                                <td className="text-muted-foreground px-4 py-2 tabular-nums">
                                                    {row.member_number ?? '—'}
                                                </td>
                                                <td className="text-muted-foreground px-4 py-2">
                                                    {row.period ?? '—'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {row.paid_at ?? '—'}
                                                    {row.paid_at ? (
                                                        <BsAfterAd adYmd={row.paid_at} />
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {row.status}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {row.company_approval}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {row.included_in_total ? 'Yes' : 'No'}
                                                </td>
                                                <td className="px-4 py-2 text-end tabular-nums">
                                                    {row.amount}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="font-medium">
                                            <td
                                                className="px-4 py-3"
                                                colSpan={7}
                                            >
                                                {savings_register.total_caption}
                                            </td>
                                            <td className="px-4 py-3 text-end tabular-nums">
                                                {savings_register.total}
                                            </td>
                                            </tr>
                                    </tfoot>
                                </table>
                            </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : null}

            {loans_register ? (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Loan register (individual)</CardTitle>
                        <CardDescription>
                            Loans issued on or before period end; repayments are
                            cumulative through the end date. Repayments in period
                            use paid dates between{' '}
                            {loans_register.period_from}
                            <BsAfterAd adYmd={loans_register.period_from} /> and{' '}
                            {loans_register.period_to}
                            <BsAfterAd adYmd={loans_register.period_to} /> ·{' '}
                            {currency}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 sm:px-6">
                        {loans_register.rows.length === 0 ? (
                            <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                                No approved loans on record for this view.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[52rem] text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="px-4 py-2 font-medium">
                                                Member
                                            </th>
                                            <th className="px-4 py-2 font-medium">
                                                No.
                                            </th>
                                            <th className="px-4 py-2 font-medium">
                                                Issued
                                            </th>
                                            <th className="px-4 py-2 font-medium">
                                                Due
                                            </th>
                                            <th className="px-4 py-2 font-medium">
                                                Status
                                            </th>
                                            <th className="px-4 py-2 text-end font-medium">
                                                Principal
                                            </th>
                                            <th className="px-4 py-2 text-end font-medium">
                                                Repaid (total)
                                            </th>
                                            <th className="px-4 py-2 text-end font-medium">
                                                Repaid (period)
                                            </th>
                                            <th className="px-4 py-2 text-end font-medium">
                                                Outstanding
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loans_register.rows.map((row, i) => (
                                            <tr
                                                key={`${row.member_name}-${row.issued_at}-${i}`}
                                                className="border-b border-border/60"
                                            >
                                                <td className="px-4 py-2">
                                                    {row.member_name}
                                                </td>
                                                <td className="text-muted-foreground px-4 py-2 tabular-nums">
                                                    {row.member_number ?? '—'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {row.issued_at ?? '—'}
                                                </td>
                                                <td className="text-muted-foreground px-4 py-2">
                                                    {row.due_date ?? '—'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {row.status}
                                                </td>
                                                <td className="px-4 py-2 text-end tabular-nums">
                                                    {row.principal}
                                                </td>
                                                <td className="px-4 py-2 text-end tabular-nums">
                                                    {row.repaid_cumulative}
                                                </td>
                                                <td className="px-4 py-2 text-end tabular-nums">
                                                    {row.repaid_in_period}
                                                </td>
                                                <td className="px-4 py-2 text-end tabular-nums font-medium">
                                                    {row.outstanding}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : null}

            {cash_flow ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Cash flow (simplified)</CardTitle>
                        <CardDescription>
                            From {cash_flow.period_from}
                            <BsAfterAd adYmd={cash_flow.period_from} /> to{' '}
                            {cash_flow.period_to}
                            <BsAfterAd adYmd={cash_flow.period_to} /> · {currency}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-0 sm:px-6 text-sm">
                        <div className="flex justify-between border-b border-border/60 py-2">
                            <span>Opening cash (net)</span>
                            <span className="tabular-nums">
                                {cash_flow.opening}
                            </span>
                        </div>
                        <ul className="space-y-2">
                            {cash_flow.lines.map((line) => (
                                <li
                                    key={line.label}
                                    className="flex justify-between gap-4 border-b border-border/40 py-1.5"
                                >
                                    <span>{line.label}</span>
                                    <span
                                        className={cn(
                                            'tabular-nums',
                                            line.amount.startsWith('-') &&
                                                'text-destructive',
                                        )}
                                    >
                                        {line.amount}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between border-t pt-3 font-semibold">
                            <span>Closing cash (net)</span>
                            <span className="tabular-nums">
                                {cash_flow.closing}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ) : null}
        </AppLayout>
    );
}
