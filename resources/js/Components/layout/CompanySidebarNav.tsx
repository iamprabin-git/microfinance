import { buttonVariants } from '@/components/ui/button';
import { HeadingIcon } from '@/components/ui/heading-icon';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    Landmark,
    LayoutDashboard,
    PiggyBank,
    Users,
    UsersRound,
    type LucideIcon,
} from 'lucide-react';

export type CompanyNavItem = {
    key: string;
    href: string;
    label: string;
    active: boolean;
    icon: LucideIcon;
};

export function buildCompanyNavItems(path: string): CompanyNavItem[] {
    const p = path.split('?')[0] ?? path;
    return [
        {
            key: 'dashboard',
            href: route('dashboard'),
            label: 'Dashboard',
            active: p === '/dashboard',
            icon: LayoutDashboard,
        },
        {
            key: 'groups',
            href: route('groups.index'),
            label: 'Groups',
            active: p.startsWith('/groups'),
            icon: UsersRound,
        },
        {
            key: 'members',
            href: route('members.index'),
            label: 'Members',
            active: p.startsWith('/members'),
            icon: Users,
        },
        {
            key: 'savings',
            href: route('savings.index'),
            label: 'Savings',
            active: p.startsWith('/savings'),
            icon: PiggyBank,
        },
        {
            key: 'loans',
            href: route('loans.index'),
            label: 'Loans',
            active: p.startsWith('/loans'),
            icon: Landmark,
        },
    ];
}

type CompanySidebarNavProps = {
    items: CompanyNavItem[];
    onNavigate?: () => void;
    className?: string;
};

export default function CompanySidebarNav({
    items,
    onNavigate,
    className,
}: CompanySidebarNavProps) {
    return (
        <nav
            className={cn('flex flex-col gap-0.5', className)}
            aria-label="Company workspace"
        >
            {items.map((item) => (
                <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                        buttonVariants({
                            variant: item.active ? 'secondary' : 'ghost',
                            size: 'sm',
                            className: 'w-full justify-start gap-2 font-normal',
                        }),
                    )}
                    onClick={onNavigate}
                >
                    <HeadingIcon icon={item.icon} size="sm" />
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}
