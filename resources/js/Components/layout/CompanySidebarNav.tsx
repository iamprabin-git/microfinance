import { buttonVariants } from '@/components/ui/button';
import { HeadingIcon } from '@/components/ui/heading-icon';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    FileSpreadsheet,
    Landmark,
    LayoutDashboard,
    PiggyBank,
    Users,
    type LucideIcon,
} from 'lucide-react';

export type CompanyNavItem = {
    key: string;
    href: string;
    label: string;
    active: boolean;
    icon: LucideIcon;
};

type CompanyNavOptions = {
    isEndUser?: boolean;
};

export function buildCompanyNavItems(
    path: string,
    options?: CompanyNavOptions,
): CompanyNavItem[] {
    const p = path.split('?')[0] ?? path;
    const isEndUser = options?.isEndUser ?? false;

    const items: CompanyNavItem[] = [
        {
            key: 'dashboard',
            href: route('dashboard'),
            label: 'Dashboard',
            active: p === '/dashboard',
            icon: LayoutDashboard,
        },
    ];

    if (!isEndUser) {
        items.push({
            key: 'members',
            href: route('members.index'),
            label: 'Members',
            active: p.startsWith('/members'),
            icon: Users,
        });
    }

    items.push(
        {
            key: 'savings',
            href: route('savings.index'),
            label: isEndUser ? 'My savings' : 'Savings',
            active: p.startsWith('/savings'),
            icon: PiggyBank,
        },
        {
            key: 'loans',
            href: route('loans.index'),
            label: isEndUser ? 'My loans' : 'Loans',
            active: p.startsWith('/loans'),
            icon: Landmark,
        },
        {
            key: 'financial-statements',
            href: route('financial-statements.index'),
            label: 'Statements',
            active: p.startsWith('/financial-statements'),
            icon: FileSpreadsheet,
        },
    );

    return items;
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
