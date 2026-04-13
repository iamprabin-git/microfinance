import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { HeadingIcon } from '@/components/ui/heading-icon';
import AppLayout from '@/Layouts/AppLayout';
import ExecutiveFinanceSection, {
    type FinancialDashboardPayload,
} from '@/Pages/Dashboard/ExecutiveFinanceSection';
import type { CompanyUserRow } from '@/types/models';
import { Head, Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, UserPlus, Users } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function roleDisplay(role: string): string {
    switch (role) {
        case 'super_admin':
            return 'Admin';
        case 'company_admin':
            return 'Company';
        case 'company_user':
            return 'Reader';
        case 'company_staff':
            return 'Staff';
        case 'company_end_user':
            return 'End user';
        default:
            return role;
    }
}

type DashboardProps = {
    companyUsers?: CompanyUserRow[];
    pendingApprovals?: { loans: number; savings: number };
    financialDashboard?: FinancialDashboardPayload | null;
};

export default function Dashboard({
    companyUsers = [],
    pendingApprovals = { loans: 0, savings: 0 },
    financialDashboard = null,
}: DashboardProps) {
    const { auth, companyPortal } = usePage().props;
    const roleLabel = roleDisplay(auth.user?.role ?? '');
    const canInvite = companyPortal?.canInvitePortalUsers ?? false;
    const canApprove = companyPortal?.canApproveRecords ?? false;

    return (
        <AppLayout title="Dashboard" titleIcon={LayoutDashboard}>
            <Head title="Dashboard" />

            {financialDashboard ? (
                <ExecutiveFinanceSection
                    data={financialDashboard}
                    userName={auth.user?.name}
                    orgName={auth.user?.company?.name}
                    roleLabel={roleLabel}
                />
            ) : (
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HeadingIcon icon={LayoutDashboard} size="sm" />
                            Welcome back
                        </CardTitle>
                        <CardDescription>
                            You are signed in to the Samuh company portal. Open{' '}
                            <Link
                                href={route('members.index')}
                                className="text-foreground font-medium underline-offset-4 hover:underline"
                            >
                                Members
                            </Link>
                            ,{' '}
                            <Link
                                href={route('savings.index')}
                                className="text-foreground font-medium underline-offset-4 hover:underline"
                            >
                                Savings
                            </Link>
                            , or{' '}
                            <Link
                                href={route('loans.index')}
                                className="text-foreground font-medium underline-offset-4 hover:underline"
                            >
                                Loans
                            </Link>{' '}
                            from the sidebar or here (end users only see their
                            own savings and loans).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p>
                            <span className="text-muted-foreground">
                                Signed in as{' '}
                            </span>
                            <Link
                                href={route('profile.edit')}
                                className="font-medium text-foreground underline-offset-4 hover:underline"
                            >
                                {auth.user?.name}
                            </Link>
                        </p>
                        <p className="flex flex-wrap items-center gap-2">
                            <span className="text-muted-foreground">Role</span>
                            <Badge variant="secondary">{roleLabel}</Badge>
                        </p>
                        {auth.user?.company ? (
                            <p>
                                <span className="text-muted-foreground">
                                    Organization{' '}
                                </span>
                                <Link
                                    href={route('members.index')}
                                    className="font-medium text-foreground underline-offset-4 hover:underline"
                                >
                                    {auth.user.company.name}
                                </Link>
                            </p>
                        ) : null}
                    </CardContent>
                </Card>
            )}

            {companyPortal?.isEndUser ? (
                <Card
                    className={cn(
                        'max-w-2xl',
                        financialDashboard ? 'mt-8' : 'mt-6',
                    )}
                >
                    <CardHeader>
                        <CardTitle className="text-base">Your account</CardTitle>
                        <CardDescription>
                            How your savings and loans appear in this portal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-muted-foreground space-y-2 text-sm leading-relaxed">
                        <p>
                            Records are matched by{' '}
                            <strong className="text-foreground">email</strong>.
                            A company admin must add a{' '}
                            <Link
                                href={route('members.index')}
                                className="font-semibold text-foreground underline-offset-4 hover:underline"
                            >
                                member
                            </Link>{' '}
                            with the same email as your login (
                            <a
                                href={`mailto:${auth.user?.email ?? ''}`}
                                className="text-foreground font-medium underline-offset-4 hover:underline"
                            >
                                {auth.user?.email}
                            </a>
                            ), then attach monthly savings and loans to that
                            member.
                        </p>
                        <p>
                            If{' '}
                            <Link
                                href={route('savings.index')}
                                className="text-foreground font-medium underline-offset-4 hover:underline"
                            >
                                My savings
                            </Link>{' '}
                            or{' '}
                            <Link
                                href={route('loans.index')}
                                className="text-foreground font-medium underline-offset-4 hover:underline"
                            >
                                My loans
                            </Link>{' '}
                            is empty, ask your organization to confirm your
                            member email matches this address and that entries
                            exist for you.
                        </p>
                    </CardContent>
                </Card>
            ) : null}

            {canInvite ? (
                <Card className={cn(financialDashboard ? 'mt-8' : 'mt-6')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HeadingIcon icon={UserPlus} size="sm" />
                            <Link
                                href={route('company.users.create')}
                                className="hover:text-primary underline-offset-4 hover:underline"
                            >
                                Portal users
                            </Link>
                        </CardTitle>
                        <CardDescription>
                            Create staff who enter data and submit it for
                            approval. End users are added from the{' '}
                            <Link
                                href={route('members.index')}
                                className="text-foreground font-medium underline-offset-4 hover:underline"
                            >
                                Members list
                            </Link>{' '}
                            (per member with an email).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                        <Link
                            href={route('company.users.create')}
                            className={cn(buttonVariants())}
                        >
                            Add staff
                        </Link>
                        <Link
                            href={route('members.index')}
                            className={cn(buttonVariants({ variant: 'outline' }))}
                        >
                            Members (end users)
                        </Link>
                    </CardContent>
                </Card>
            ) : null}

            {canApprove &&
            (pendingApprovals.loans > 0 || pendingApprovals.savings > 0) ? (
                <Card
                    className={cn(
                        'border-amber-500/40',
                        financialDashboard ? 'mt-8' : 'mt-6',
                    )}
                >
                    <CardHeader>
                        <CardTitle>Pending approvals</CardTitle>
                        <CardDescription>
                            Staff changes waiting for your decision.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        {pendingApprovals.loans > 0 ? (
                            <Link
                                href={route('loans.index')}
                                className="group text-foreground -mx-2 block rounded-md px-2 py-2 no-underline transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <span className="font-medium tabular-nums">
                                    {pendingApprovals.loans}
                                </span>{' '}
                                loan
                                {pendingApprovals.loans === 1 ? '' : 's'} —{' '}
                                <span className="font-medium underline-offset-4 group-hover:underline">
                                    Review loans
                                </span>
                            </Link>
                        ) : null}
                        {pendingApprovals.savings > 0 ? (
                            <Link
                                href={route('savings.index')}
                                className="group text-foreground -mx-2 block rounded-md px-2 py-2 no-underline transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <span className="font-medium tabular-nums">
                                    {pendingApprovals.savings}
                                </span>{' '}
                                saving record
                                {pendingApprovals.savings === 1 ? '' : 's'} —{' '}
                                <span className="font-medium underline-offset-4 group-hover:underline">
                                    Review savings
                                </span>
                            </Link>
                        ) : null}
                    </CardContent>
                </Card>
            ) : null}

            <Card className={cn(financialDashboard ? 'mt-8' : 'mt-6')}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={Users} size="sm" />
                        <Link
                            href={route('members.index')}
                            className="hover:text-primary rounded underline-offset-4 hover:underline"
                        >
                            People in your organization
                        </Link>
                    </CardTitle>
                    <CardDescription>
                        Users who belong to{' '}
                        <Link
                            href={route('members.index')}
                            className="text-foreground font-medium underline-offset-4 hover:underline"
                        >
                            {auth.user?.company?.name ?? 'your company'}
                        </Link>
                        .
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                    {companyUsers.length === 0 ? (
                        <p className="text-muted-foreground px-4 text-sm sm:px-0">
                            No other users yet.
                            {canInvite ? (
                                <>
                                    {' '}
                                    <Link
                                        href={route('company.users.create')}
                                        className="text-foreground font-medium underline-offset-4 hover:underline"
                                    >
                                        Add staff
                                    </Link>
                                    {' or '}
                                    <Link
                                        href={route('members.index')}
                                        className="text-foreground font-medium underline-offset-4 hover:underline"
                                    >
                                        open Members
                                    </Link>
                                    .
                                </>
                            ) : (
                                <>
                                    {' '}
                                    <Link
                                        href={route('members.index')}
                                        className="text-foreground font-medium underline-offset-4 hover:underline"
                                    >
                                        Open Members
                                    </Link>{' '}
                                    to invite people.
                                </>
                            )}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[28rem] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-3 font-medium">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Role
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companyUsers.map((u) => (
                                        <tr
                                            key={u.id}
                                            className="border-b border-border/60 last:border-0"
                                        >
                                            <td className="px-4 py-3">
                                                {u.id === auth.user?.id ? (
                                                    <Link
                                                        href={route(
                                                            'profile.edit',
                                                        )}
                                                        className="font-medium text-foreground underline-offset-4 hover:underline"
                                                    >
                                                        {u.name}
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={route(
                                                            'members.index',
                                                        )}
                                                        className="font-medium text-foreground underline-offset-4 hover:underline"
                                                    >
                                                        {u.name}
                                                    </Link>
                                                )}
                                                {u.id === auth.user?.id ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="ml-2 align-middle"
                                                    >
                                                        You
                                                    </Badge>
                                                ) : null}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3">
                                                <a
                                                    href={`mailto:${u.email}`}
                                                    className="hover:text-foreground underline-offset-4 hover:underline"
                                                >
                                                    {u.email}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="secondary">
                                                    {roleDisplay(u.role)}
                                                </Badge>
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
