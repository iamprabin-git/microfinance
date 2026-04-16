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
import type { MemberListRow } from '@/types/models';
import { Head, Link, usePage } from '@inertiajs/react';
import { Users } from 'lucide-react';

type IndexProps = {
    members: MemberListRow[];
};

export default function Index({ members }: IndexProps) {
    const { companyPortal } = usePage().props;
    const canManage = companyPortal?.canManage ?? false;
    const canInviteEndUser = companyPortal?.canInvitePortalUsers ?? false;

    return (
        <AppLayout title="Members">
            <Head title="Members" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground max-w-xl text-sm">
                    Members are shared across your organization. Admins and
                    staff can add and edit; others can view. Company admins can
                    create an end user from a row when the member has an email.
                </p>
                {canManage ? (
                    <Link
                        href={route('members.create')}
                        className={cn(buttonVariants())}
                    >
                        Add member
                    </Link>
                ) : null}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeadingIcon icon={Users} size="sm" />
                        Directory
                    </CardTitle>
                    <CardDescription>
                        Everyone registered for your cooperative.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                    {members.length === 0 ? (
                        <p className="text-muted-foreground px-4 text-sm sm:px-0">
                            No members yet. Use &quot;Add member&quot; to build
                            your directory.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[36rem] text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-3 font-medium">
                                            Serial #
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Savings A/c
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Contact
                                        </th>
                                        {canManage || canInviteEndUser ? (
                                            <th className="px-4 py-3 font-medium text-end">
                                                Actions
                                            </th>
                                        ) : null}
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((m) => (
                                        <tr
                                            key={m.id}
                                            className="border-b border-border/60 last:border-0"
                                        >
                                            <td className="text-muted-foreground px-4 py-3 font-mono text-xs tabular-nums">
                                                {m.member_number ?? '—'}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3 font-mono text-xs tabular-nums">
                                                {m.savings_account_number ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                <div className="flex items-center gap-2">
                                                    {m.profile_photo_url ? (
                                                        <img
                                                            src={
                                                                m.profile_photo_url
                                                            }
                                                            alt={`${m.name} profile`}
                                                            className="border-border size-8 shrink-0 rounded-full border object-cover"
                                                        />
                                                    ) : null}
                                                    <span>{m.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3">
                                                {[m.email, m.phone]
                                                    .filter(Boolean)
                                                    .join(' · ') || '—'}
                                            </td>
                                            {canManage || canInviteEndUser ? (
                                                <td className="px-4 py-3 text-end">
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        {canInviteEndUser &&
                                                        m.email ? (
                                                            <Link
                                                                href={route(
                                                                    'members.end-user.create',
                                                                    m.id,
                                                                )}
                                                                className={cn(
                                                                    buttonVariants(
                                                                        {
                                                                            variant:
                                                                                'secondary',
                                                                            size: 'sm',
                                                                        },
                                                                    ),
                                                                )}
                                                            >
                                                                End user
                                                            </Link>
                                                        ) : null}
                                                        {canManage ? (
                                                            <>
                                                                {!m.savings_account_number?.trim() ? (
                                                                    <Link
                                                                        href={route(
                                                                            'members.savings-account.store',
                                                                            m.id,
                                                                        )}
                                                                        method="post"
                                                                        as="button"
                                                                        className={cn(
                                                                            buttonVariants(
                                                                                {
                                                                                    variant:
                                                                                        'secondary',
                                                                                    size: 'sm',
                                                                                },
                                                                            ),
                                                                        )}
                                                                    >
                                                                        Issue savings
                                                                    </Link>
                                                                ) : null}
                                                                <Link
                                                                    href={route(
                                                                        'members.edit',
                                                                        m.id,
                                                                    )}
                                                                    className={cn(
                                                                        buttonVariants(
                                                                            {
                                                                                variant:
                                                                                    'outline',
                                                                                size: 'sm',
                                                                            },
                                                                        ),
                                                                    )}
                                                                >
                                                                    Edit
                                                                </Link>
                                                                <Link
                                                                    href={route(
                                                                        'members.destroy',
                                                                        m.id,
                                                                    )}
                                                                    method="delete"
                                                                    as="button"
                                                                    className={cn(
                                                                        buttonVariants(
                                                                            {
                                                                                variant:
                                                                                    'ghost',
                                                                                size: 'sm',
                                                                            },
                                                                        ),
                                                                        'text-destructive',
                                                                    )}
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        if (
                                                                            !confirm(
                                                                                'Remove this member? Related savings and loans must be handled first.',
                                                                            )
                                                                        ) {
                                                                            e.preventDefault();
                                                                        }
                                                                    }}
                                                                >
                                                                    Remove
                                                                </Link>
                                                            </>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            ) : null}
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
