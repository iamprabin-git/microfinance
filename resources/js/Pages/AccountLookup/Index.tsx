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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/Layouts/AppLayout';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import { Landmark, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

type MemberResult = {
    id: number;
    member_number: number | null;
    savings_account_number: string | null;
    name: string;
    email: string | null;
    phone: string | null;
};

type LoanResult = {
    id: number;
    loan_account_number: string | null;
    principal: string;
    issued_at: string | null;
    status: string;
    member: { id: number | null; name: string };
};

type IndexProps = {
    q: string;
    members: MemberResult[];
    loans: LoanResult[];
};

export default function Index({ q, members, loans }: IndexProps) {
    const [value, setValue] = useState(q);
    const hasQuery = q.trim().length > 0;

    const memberEmpty = members.length === 0;
    const loanEmpty = loans.length === 0;
    const nothingFound = hasQuery && memberEmpty && loanEmpty;

    const canSearchHint = useMemo(() => {
        if (!hasQuery) {
            return 'Search by account number, name, or ID (#).';
        }
        return `Results for “${q}”`;
    }, [hasQuery, q]);

    return (
        <AppLayout title="Account lookup" titleIcon={Search} hidePrint={false}>
            <Head title="Account lookup" />

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={Search} size="sm" />
                        Find an account
                    </CardTitle>
                    <CardDescription>{canSearchHint}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            router.get(
                                route('account-lookup.index'),
                                { q: value },
                                { preserveScroll: true },
                            );
                        }}
                        className="flex flex-wrap items-end gap-3"
                    >
                        <div className="min-w-[16rem] flex-1 space-y-1.5">
                            <Label htmlFor="q">Search</Label>
                            <Input
                                id="q"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Account no. / name / member # / loan id"
                            />
                        </div>
                        <button type="submit" className={cn(buttonVariants())}>
                            Search
                        </button>
                        {hasQuery ? (
                            <Link
                                href={route('account-lookup.index')}
                                className={cn(
                                    buttonVariants({ variant: 'outline' }),
                                )}
                            >
                                Clear
                            </Link>
                        ) : null}
                    </form>
                </CardContent>
            </Card>

            {nothingFound ? (
                <p className="text-muted-foreground mb-6 text-sm">
                    No matching savings or loan accounts found.
                </p>
            ) : null}

            {members.length > 0 ? (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HeadingIcon icon={Users} size="sm" />
                            Savings accounts
                        </CardTitle>
                        <CardDescription>Matching members</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 sm:px-6">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[42rem] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-3 font-medium">
                                            Savings A/c
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Member #
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Contact
                                        </th>
                                        <th className="px-4 py-3 font-medium text-end">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((m) => (
                                        <tr
                                            key={m.id}
                                            className="border-b border-border/60 last:border-0"
                                        >
                                            <td className="text-muted-foreground px-4 py-3 font-mono text-xs tabular-nums">
                                                {m.savings_account_number ?? '—'}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3 font-mono text-xs tabular-nums">
                                                {m.member_number ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                {m.name}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3">
                                                {[m.email, m.phone]
                                                    .filter(Boolean)
                                                    .join(' · ') || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <Link
                                                        href={route(
                                                            'savings-transactions.create',
                                                            {
                                                                member_id: m.id,
                                                                type: 'deposit',
                                                            },
                                                        )}
                                                        className={cn(
                                                            buttonVariants({
                                                                variant: 'outline',
                                                                size: 'sm',
                                                            }),
                                                        )}
                                                    >
                                                        Deposit
                                                    </Link>
                                                    <Link
                                                        href={route(
                                                            'savings-transactions.create',
                                                            {
                                                                member_id: m.id,
                                                                type: 'withdraw',
                                                            },
                                                        )}
                                                        className={cn(
                                                            buttonVariants({
                                                                variant: 'outline',
                                                                size: 'sm',
                                                            }),
                                                        )}
                                                    >
                                                        Withdraw
                                                    </Link>
                                                    <Link
                                                        href={route(
                                                            'members.savings-statement',
                                                            m.id,
                                                        )}
                                                        className={cn(
                                                            buttonVariants({
                                                                variant: 'secondary',
                                                                size: 'sm',
                                                            }),
                                                        )}
                                                    >
                                                        Statement
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            {loans.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HeadingIcon icon={Landmark} size="sm" />
                            Loan accounts
                        </CardTitle>
                        <CardDescription>Matching loans</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 sm:px-6">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[48rem] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-3 font-medium">
                                            Loan A/c
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Member
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Issued
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 font-medium text-end">
                                            Principal
                                        </th>
                                        <th className="px-4 py-3 font-medium text-end">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loans.map((l) => (
                                        <tr
                                            key={l.id}
                                            className="border-b border-border/60 last:border-0"
                                        >
                                            <td className="text-muted-foreground px-4 py-3 font-mono text-xs tabular-nums">
                                                {l.loan_account_number ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                {l.member.name}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3 tabular-nums">
                                                {l.issued_at ?? '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        l.status === 'active'
                                                            ? 'secondary'
                                                            : 'default'
                                                    }
                                                >
                                                    {l.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-end tabular-nums">
                                                {l.principal}
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <Link
                                                        href={route(
                                                            'loans.edit',
                                                            l.id,
                                                        )}
                                                        className={cn(
                                                            buttonVariants({
                                                                variant: 'outline',
                                                                size: 'sm',
                                                            }),
                                                        )}
                                                    >
                                                        Repayment
                                                    </Link>
                                                    <Link
                                                        href={route(
                                                            'loans.statement',
                                                            l.id,
                                                        )}
                                                        className={cn(
                                                            buttonVariants({
                                                                variant: 'secondary',
                                                                size: 'sm',
                                                            }),
                                                        )}
                                                    >
                                                        Statement
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

        </AppLayout>
    );
}

