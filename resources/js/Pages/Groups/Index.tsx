import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { HeadingIcon } from '@/components/ui/heading-icon';
import AppLayout from '@/Layouts/AppLayout';
import type { GroupRow } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { FolderOpen, UsersRound } from 'lucide-react';

type IndexProps = {
    groups: GroupRow[];
};

export default function Index({ groups }: IndexProps) {
    return (
        <AppLayout title="Groups" titleIcon={UsersRound}>
            <Head title="Groups" />

            {groups.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HeadingIcon icon={FolderOpen} size="sm" />
                            No groups yet
                        </CardTitle>
                        <CardDescription>
                            Create savings groups from the database or an admin
                            tool for now — this page lists groups for your
                            organization.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HeadingIcon icon={UsersRound} size="sm" />
                            Your groups
                        </CardTitle>
                        <CardDescription>
                            Savings circles scoped to your company.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 sm:px-6">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[32rem] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-3 font-medium">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Monthly
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groups.map((g) => (
                                        <tr
                                            key={g.id}
                                            className="border-b border-border/60 last:border-0"
                                        >
                                            <td className="px-4 py-3 align-top">
                                                <div className="font-medium">
                                                    {g.name}
                                                </div>
                                                {g.description ? (
                                                    <p className="text-muted-foreground mt-1 max-w-md text-xs leading-relaxed">
                                                        {g.description}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3 align-top tabular-nums">
                                                {g.currency}{' '}
                                                {g.monthly_contribution_amount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            <p className="text-muted-foreground mt-6 text-sm">
                <Link
                    href={route('dashboard')}
                    className="text-foreground font-medium underline-offset-4 hover:underline"
                >
                    Back to dashboard
                </Link>
            </p>
        </AppLayout>
    );
}
