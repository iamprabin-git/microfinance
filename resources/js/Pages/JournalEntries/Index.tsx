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
import { NotebookPen } from 'lucide-react';

type EntryLine = {
    id: number;
    account: string;
    debit: string;
    credit: string;
    description: string | null;
};

type EntryRow = {
    id: number;
    occurred_at: string | null;
    reference: string | null;
    memo: string | null;
    member: {
        id: number;
        name: string;
        member_number: number | null;
        savings_account_number: string | null;
    } | null;
    loan: { id: number; loan_account_number: string | null } | null;
    total_debit: string;
    total_credit: string;
    lines: EntryLine[];
};

type IndexProps = {
    entries: EntryRow[];
    can_post: boolean;
    missing_tables?: boolean;
};

export default function Index({ entries, can_post, missing_tables }: IndexProps) {
    return (
        <AppLayout title="Journal entries" titleIcon={NotebookPen} hidePrint={false}>
            <Head title="Journal entries" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <p className="text-muted-foreground max-w-xl text-sm">
                    Post adjusting entries to your chart of accounts. Debits must
                    equal credits.
                </p>
                {can_post ? (
                    <Link
                        href={route('journal-entries.create')}
                        className={cn(buttonVariants())}
                    >
                        New entry
                    </Link>
                ) : null}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={NotebookPen} size="sm" />
                        Entries
                    </CardTitle>
                    <CardDescription>
                        Most recent adjustments (latest first).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {missing_tables ? (
                        <p className="text-muted-foreground text-sm">
                            Journal tables are not created yet. Run{' '}
                            <span className="font-mono">php artisan migrate</span>{' '}
                            and refresh this page.
                        </p>
                    ) : entries.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No journal entries yet.
                        </p>
                    ) : (
                        entries.map((e) => (
                            <div
                                key={e.id}
                                className="rounded-lg border border-border/60"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 bg-muted/20 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {e.reference?.trim()
                                                ? e.reference
                                                : `Entry #${e.id}`}
                                        </p>
                                        <p className="text-muted-foreground mt-0.5 text-xs">
                                            {e.occurred_at ?? '—'}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {e.member ? (
                                                <>
                                                    Member:{' '}
                                                    {[
                                                        e.member.name,
                                                        e.member.member_number != null
                                                            ? `#${e.member.member_number}`
                                                            : null,
                                                        e.member.savings_account_number,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </>
                                            ) : null}
                                            {e.member && e.loan ? ' · ' : null}
                                            {e.loan ? (
                                                <>
                                                    Loan:{' '}
                                                    {e.loan.loan_account_number ??
                                                        `#${e.loan.id}`}
                                                </>
                                            ) : null}
                                        </p>
                                        {e.memo?.trim() ? (
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                {e.memo}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="text-xs">
                                        <Badge variant="secondary">
                                            Dr {e.total_debit}
                                        </Badge>{' '}
                                        <Badge variant="secondary">
                                            Cr {e.total_credit}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[44rem] text-sm">
                                        <thead>
                                            <tr className="border-b border-border/60 text-left text-xs">
                                                <th className="px-4 py-2 font-semibold">
                                                    Account
                                                </th>
                                                <th className="px-4 py-2 font-semibold">
                                                    Description
                                                </th>
                                                <th className="px-4 py-2 text-right font-semibold">
                                                    Debit
                                                </th>
                                                <th className="px-4 py-2 text-right font-semibold">
                                                    Credit
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {e.lines.map((l) => (
                                                <tr
                                                    key={l.id}
                                                    className="border-b border-border/40 last:border-0"
                                                >
                                                    <td className="px-4 py-2">
                                                        {l.account}
                                                    </td>
                                                    <td className="text-muted-foreground px-4 py-2">
                                                        {l.description ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-2 text-right tabular-nums">
                                                        {Number(l.debit) > 0
                                                            ? l.debit
                                                            : '—'}
                                                    </td>
                                                    <td className="px-4 py-2 text-right tabular-nums">
                                                        {Number(l.credit) > 0
                                                            ? l.credit
                                                            : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}

