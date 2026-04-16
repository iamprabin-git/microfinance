import { buttonVariants } from '@/components/ui/button';
import { HeadingIcon } from '@/components/ui/heading-icon';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    FileSpreadsheet,
    FolderTree,
    Landmark,
    LayoutDashboard,
    NotebookPen,
    Package,
    PiggyBank,
    Receipt,
    Search,
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
    canManage?: boolean;
};

export function buildCompanyNavItems(
    path: string,
    options?: CompanyNavOptions,
): CompanyNavItem[] {
    const p = path.split('?')[0] ?? path;
    const isEndUser = options?.isEndUser ?? false;
    const canManage = options?.canManage ?? false;

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
        ...(canManage
            ? [
                  {
                      key: 'account-lookup',
                      href: route('account-lookup.index'),
                      label: 'Account lookup',
                      active: p.startsWith('/account-lookup'),
                      icon: Search,
                  } satisfies CompanyNavItem,
                  {
                      key: 'journal-vouchers',
                      href: route('journal-vouchers.index'),
                      label: 'Journal entries',
                      active: p.startsWith('/journal-vouchers'),
                      icon: NotebookPen,
                  } satisfies CompanyNavItem,
                  {
                      key: 'products',
                      href: route('products.index'),
                      label: 'Products',
                      active: p.startsWith('/products'),
                      icon: Package,
                  } satisfies CompanyNavItem,
                  {
                      key: 'chart-of-accounts',
                      href: route('chart-of-accounts.index'),
                      label: 'Chart of accounts',
                      active: p.startsWith('/chart-of-accounts'),
                      icon: FolderTree,
                  } satisfies CompanyNavItem,
              ]
            : []),
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
