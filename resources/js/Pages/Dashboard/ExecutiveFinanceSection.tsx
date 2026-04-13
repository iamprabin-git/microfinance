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
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { BarChart3, Landmark, PiggyBank, TrendingUp } from 'lucide-react';
import {
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export type FinancialDashboardPayload = {
    as_of: string;
    currency: string;
    kpis: {
        assets: number;
        liabilities: number;
        equity: number;
        net_activity_mtd: number;
        income_mtd: number;
        expenses_mtd: number;
    };
    monthly_trend: {
        key: string;
        label: string;
        income: number;
        expenses: number;
        net: number;
    }[];
    income_mix: { name: string; value: number }[];
    expense_mix: { name: string; value: number }[];
    balance_structure: { name: string; value: number }[];
    ratios: {
        key: string;
        label: string;
        value: number | null;
        display: string;
    }[];
};

const CHART_COLORS = [
    'hsl(173 58% 39%)',
    'hsl(215 25% 47%)',
    'hsl(38 92% 50%)',
    'hsl(347 77% 50%)',
    'hsl(262 52% 47%)',
    'hsl(142 71% 45%)',
];

function monthStartFromIsoDate(iso: string): string {
    const [y, m] = iso.split('-');
    if (!y || !m) {
        return iso;
    }

    return `${y}-${m.padStart(2, '0')}-01`;
}

function formatMoney(amount: number, currency: string): string {
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
}

type ExecutiveFinanceSectionProps = {
    data: FinancialDashboardPayload;
    userName?: string;
    orgName?: string;
    roleLabel: string;
};

export default function ExecutiveFinanceSection({
    data,
    userName,
    orgName,
    roleLabel,
}: ExecutiveFinanceSectionProps) {
    const { currency, kpis, monthly_trend, income_mix, expense_mix, balance_structure, ratios, as_of } = data;

    const fmt = (n: number) => formatMoney(n, currency);
    const mtdFrom = monthStartFromIsoDate(as_of);
    const balanceSheetHref = route('financial-statements.index', {
        report: 'balance-sheet',
        as_of,
    });
    const profitLossMtdHref = route('financial-statements.index', {
        report: 'profit-and-loss',
        from: mtdFrom,
        to: as_of,
    });
    const trialBalanceHref = route('financial-statements.index', {
        report: 'trial-balance',
        as_of,
    });
    const savingsRegisterHref = route('financial-statements.index', {
        report: 'savings-register',
        from: mtdFrom,
        to: as_of,
    });
    const loansRegisterHref = route('financial-statements.index', {
        report: 'loans-register',
        from: mtdFrom,
        to: as_of,
    });

    const ratioHref = (key: string): string =>
        key === 'net_margin_mtd'
            ? profitLossMtdHref
            : route('financial-statements.index', {
                  report: 'balance-sheet',
                  as_of,
              });

    const cardLinkClass =
        'block rounded-xl no-underline transition hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="text-foreground flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight">
                        <HeadingIcon icon={BarChart3} size="sm" />
                        <Link
                            href={trialBalanceHref}
                            className="hover:text-primary decoration-primary/40 rounded underline-offset-4 hover:underline"
                        >
                            Financial overview
                        </Link>
                    </h2>
                    <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                        Management snapshot from{' '}
                        <Link
                            href={route('loans.index')}
                            className="text-foreground font-medium underline-offset-4 hover:underline"
                        >
                            loans
                        </Link>
                        ,{' '}
                        <Link
                            href={route('savings.index')}
                            className="text-foreground font-medium underline-offset-4 hover:underline"
                        >
                            savings
                        </Link>
                        , and paid activity. As of{' '}
                        <Link
                            href={trialBalanceHref}
                            className="text-foreground font-medium underline-offset-4 hover:underline"
                        >
                            {as_of}
                        </Link>{' '}
                        ({currency}).
                    </p>
                    <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        {userName ? (
                            <span>
                                <Link
                                    href={route('profile.edit')}
                                    className="font-medium text-foreground underline-offset-4 hover:underline"
                                >
                                    {userName}
                                </Link>
                            </span>
                        ) : null}
                        {orgName ? (
                            <span>
                                ·{' '}
                                <Link
                                    href={balanceSheetHref}
                                    className="font-medium text-foreground underline-offset-4 hover:underline"
                                >
                                    {orgName}
                                </Link>
                            </span>
                        ) : null}
                        <span className="flex items-center gap-1.5">
                            · <Badge variant="secondary">{roleLabel}</Badge>
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:items-end">
                    <Link
                        href={route('financial-statements.index', {
                            report: 'trial-balance',
                            as_of,
                        })}
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                    >
                        <TrendingUp className="mr-2 size-4 opacity-80" aria-hidden />
                        Financial statements
                    </Link>
                    <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-xs">
                        <Link
                            href={savingsRegisterHref}
                            className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
                        >
                            <PiggyBank className="size-3.5 shrink-0 opacity-70" aria-hidden />
                            Savings register
                        </Link>
                        <span className="text-border hidden sm:inline" aria-hidden>
                            ·
                        </span>
                        <Link
                            href={loansRegisterHref}
                            className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
                        >
                            <Landmark className="size-3.5 shrink-0 opacity-70" aria-hidden />
                            Loan register
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link href={balanceSheetHref} className={cardLinkClass}>
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Total assets</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">
                                {fmt(kpis.assets)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-xs">
                            Loans receivable and positive cash
                        </CardContent>
                    </Card>
                </Link>
                <Link href={balanceSheetHref} className={cardLinkClass}>
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Liabilities</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">
                                {fmt(kpis.liabilities)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-xs">
                            Savings payable and funding overdraft
                        </CardContent>
                    </Card>
                </Link>
                <Link href={balanceSheetHref} className={cardLinkClass}>
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Members&apos; equity</CardDescription>
                            <CardTitle
                                className={cn(
                                    'text-2xl font-semibold tabular-nums',
                                    kpis.equity < 0 && 'text-destructive',
                                )}
                            >
                                {fmt(kpis.equity)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-xs">
                            Net assets after member obligations
                        </CardContent>
                    </Card>
                </Link>
                <Link href={profitLossMtdHref} className={cardLinkClass}>
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Net activity (MTD)</CardDescription>
                            <CardTitle
                                className={cn(
                                    'text-2xl font-semibold tabular-nums',
                                    kpis.net_activity_mtd < 0 && 'text-destructive',
                                )}
                            >
                                {fmt(kpis.net_activity_mtd)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-xs">
                            Inflows {fmt(kpis.income_mtd)} · Outflows{' '}
                            {fmt(kpis.expenses_mtd)}
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <Link href={profitLossMtdHref} className={cardLinkClass}>
                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base">
                                Income vs expenses
                            </CardTitle>
                            <CardDescription>
                                Last six calendar months (cash-style activity)
                            </CardDescription>
                        </div>
                        <span
                            className={cn(
                                buttonVariants({ variant: 'ghost', size: 'sm' }),
                                'pointer-events-none shrink-0 text-xs text-muted-foreground',
                            )}
                        >
                            Open P&amp;L
                        </span>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full pl-0 pr-2 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={monthly_trend}
                            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11 }}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                className="text-muted-foreground"
                                tickFormatter={(v) =>
                                    new Intl.NumberFormat(undefined, {
                                        notation: 'compact',
                                        maximumFractionDigits: 1,
                                    }).format(Number(v))
                                }
                            />
                            <Tooltip
                                formatter={(value: number) => [fmt(value), '']}
                                labelClassName="text-foreground"
                                contentStyle={{
                                    borderRadius: '0.5rem',
                                    fontSize: '0.75rem',
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Line
                                type="monotone"
                                dataKey="income"
                                name="Income"
                                stroke={CHART_COLORS[0]}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                name="Expenses"
                                stroke={CHART_COLORS[3]}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="net"
                                name="Net"
                                stroke={CHART_COLORS[1]}
                                strokeWidth={2}
                                strokeDasharray="5 4"
                                dot={{ r: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
                </Card>
            </Link>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base">
                                <Link
                                    href={profitLossMtdHref}
                                    className="hover:text-primary underline-offset-4 hover:underline"
                                >
                                    Income mix (MTD)
                                </Link>
                            </CardTitle>
                            <CardDescription>
                                Repayments, savings, and other income
                            </CardDescription>
                        </div>
                        <Link
                            href={profitLossMtdHref}
                            className={cn(
                                buttonVariants({ variant: 'ghost', size: 'sm' }),
                                'shrink-0 text-xs',
                            )}
                        >
                            P&amp;L
                        </Link>
                    </CardHeader>
                    <CardContent className="h-[260px]">
                        {income_mix.length === 0 ? (
                            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm">
                                <p>No income recorded this month.</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <Link
                                        href={route('savings.index')}
                                        className="text-primary text-xs font-medium underline-offset-4 hover:underline"
                                    >
                                        Savings
                                    </Link>
                                    <Link
                                        href={route('loans.index')}
                                        className="text-primary text-xs font-medium underline-offset-4 hover:underline"
                                    >
                                        Loans
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={income_mix}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={52}
                                        outerRadius={88}
                                        paddingAngle={2}
                                    >
                                        {income_mix.map((_, i) => (
                                            <Cell
                                                key={`inc-${i}`}
                                                fill={CHART_COLORS[i % CHART_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => fmt(v)} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base">
                                <Link
                                    href={profitLossMtdHref}
                                    className="hover:text-primary underline-offset-4 hover:underline"
                                >
                                    Outflows (MTD)
                                </Link>
                            </CardTitle>
                            <CardDescription>
                                Disbursements and operating expenses
                            </CardDescription>
                        </div>
                        <Link
                            href={profitLossMtdHref}
                            className={cn(
                                buttonVariants({ variant: 'ghost', size: 'sm' }),
                                'shrink-0 text-xs',
                            )}
                        >
                            P&amp;L
                        </Link>
                    </CardHeader>
                    <CardContent className="h-[260px]">
                        {expense_mix.length === 0 ? (
                            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm">
                                <p>No disbursements or expenses this month.</p>
                                <Link
                                    href={route('loans.index')}
                                    className="text-primary text-xs font-medium underline-offset-4 hover:underline"
                                >
                                    Loans
                                </Link>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expense_mix}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={52}
                                        outerRadius={88}
                                        paddingAngle={2}
                                    >
                                        {expense_mix.map((_, i) => (
                                            <Cell
                                                key={`exp-${i}`}
                                                fill={
                                                    CHART_COLORS[
                                                        (i + 2) % CHART_COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => fmt(v)} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/80 shadow-sm">
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-base">
                            <Link
                                href={balanceSheetHref}
                                className="hover:text-primary underline-offset-4 hover:underline"
                            >
                                Position composition
                            </Link>
                        </CardTitle>
                        <CardDescription>
                            Major asset, liability, and equity components
                            (magnitudes)
                        </CardDescription>
                    </div>
                    <Link
                        href={balanceSheetHref}
                        className={cn(
                            buttonVariants({ variant: 'ghost', size: 'sm' }),
                            'shrink-0 text-xs',
                        )}
                    >
                        Balance sheet
                    </Link>
                </CardHeader>
                <CardContent className="h-[280px]">
                    {balance_structure.length === 0 ? (
                        <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm">
                            <p>No balances to chart yet.</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <Link
                                    href={route('members.index')}
                                    className="text-primary text-xs font-medium underline-offset-4 hover:underline"
                                >
                                    Members
                                </Link>
                                <Link
                                    href={route('loans.index')}
                                    className="text-primary text-xs font-medium underline-offset-4 hover:underline"
                                >
                                    Loans
                                </Link>
                                <Link
                                    href={route('savings.index')}
                                    className="text-primary text-xs font-medium underline-offset-4 hover:underline"
                                >
                                    Savings
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={balance_structure}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={56}
                                    outerRadius={96}
                                    paddingAngle={1}
                                >
                                    {balance_structure.map((_, i) => (
                                        <Cell
                                            key={`bal-${i}`}
                                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: number) => fmt(v)} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {ratios.length > 0 ? (
                <Card className="border-border/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Financial ratios</CardTitle>
                        <CardDescription>
                            Simple indicators from the same simplified ledger as{' '}
                            <Link
                                href={trialBalanceHref}
                                className="text-foreground font-medium underline-offset-4 hover:underline"
                            >
                                financial statements
                            </Link>
                            .
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-border/60 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {ratios.map((r) => (
                                <li key={r.key}>
                                    <Link
                                        href={ratioHref(r.key)}
                                        className="block rounded-lg border border-border/60 bg-muted/20 px-4 py-3 no-underline transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <p className="text-muted-foreground text-xs font-medium leading-snug">
                                            {r.label}
                                        </p>
                                        <p className="mt-1.5 text-lg font-semibold tabular-nums tracking-tight text-foreground">
                                            {r.display}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}
