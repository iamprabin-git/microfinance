import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/Layouts/AppLayout';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CompanyUserRow } from '@/types/models';
import { Head, Link, usePage } from '@inertiajs/react';

function roleDisplay(role: string): string {
    switch (role) {
        case 'company_admin':
            return 'Company admin';
        case 'company_user':
            return 'Company user';
        default:
            return role;
    }
}

type DashboardProps = {
    companyUsers?: CompanyUserRow[];
};

export default function Dashboard({ companyUsers = [] }: DashboardProps) {
    const { auth } = usePage().props;
    const roleLabel =
        auth.user?.role === 'company_admin'
            ? 'Company admin'
            : 'Company user';

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome back</CardTitle>
                        <CardDescription>
                            You are signed in to the Samuh company portal
                            (Inertia + shadcn/ui, served by Laravel).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p>
                            <span className="text-muted-foreground">
                                Signed in as{' '}
                            </span>
                            <span className="font-medium">
                                {auth.user?.name}
                            </span>
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
                                <span className="font-medium">
                                    {auth.user.company.name}
                                </span>
                            </p>
                        ) : null}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Next steps</CardTitle>
                        <CardDescription>
                            Accounting CRUD can be added here as Inertia pages
                            calling your Laravel routes, reusing the same
                            multi-tenant models as before.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-muted-foreground text-sm">
                        <p>
                            Open{' '}
                            <Link
                                href={route('groups.index')}
                                className={cn(
                                    buttonVariants({
                                        variant: 'link',
                                        size: 'sm',
                                    }),
                                    'h-auto p-0 text-sm',
                                )}
                            >
                                Groups
                            </Link>{' '}
                            to see savings circles for your company.
                        </p>
                        <p>
                            UI lives in{' '}
                            <code className="bg-muted rounded px-1 py-0.5 text-xs">
                                resources/js
                            </code>{' '}
                            (React + shadcn, Vite)—no separate Next.js app.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>People in your organization</CardTitle>
                    <CardDescription>
                        Users who belong to{' '}
                        {auth.user?.company?.name ?? 'your company'}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                    {companyUsers.length === 0 ? (
                        <p className="text-muted-foreground px-4 text-sm sm:px-0">
                            No other users yet.
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
                                                <span className="font-medium">
                                                    {u.name}
                                                </span>
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
                                                {u.email}
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
