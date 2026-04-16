import { Button, buttonVariants } from '@/components/ui/button';
import { HeadingIcon } from '@/components/ui/heading-icon';
import { Separator } from '@/components/ui/separator';
import ThemeToggle from '@/components/layout/ThemeToggle';
import type { CompanyNavItem } from '@/components/layout/CompanySidebarNav';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
    Menu as HMenu,
    MenuButton,
    MenuItem,
    MenuItems,
} from '@headlessui/react';
import { Link, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    FileSpreadsheet,
    Landmark,
    LayoutDashboard,
    LogOut,
    Menu,
    PiggyBank,
    User,
    Users,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type AppHeaderProps = {
    /** When true, coop modules live in the sidebar; desktop header omits those links. */
    companySidebarLayout?: boolean;
    /** Company workspace nav items (used for mobile drawer + breadcrumbs when sidebar layout is enabled). */
    navItems?: CompanyNavItem[];
    pageTitle?: string;
    pageTitleIcon?: LucideIcon;
};

type Crumb = {
    key: string;
    label: string;
    href?: string;
    current?: boolean;
};

export default function AppHeader({
    companySidebarLayout = false,
    navItems = [],
    pageTitle,
    pageTitleIcon: PageTitleIcon,
}: AppHeaderProps) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const [mobileOpen, setMobileOpen] = useState(false);

    const path = url.split('?')[0] ?? url;
    const onDashboard = path === '/dashboard';
    const onMembers = path.startsWith('/members');
    const onSavings = path.startsWith('/savings');
    const onLoans = path.startsWith('/loans');
    const onFinancialStatements = path.startsWith('/financial-statements');
    const onProfile = path.startsWith('/profile');

    /** Below this breakpoint the drawer lists all routes; bar shows Profile/Logout only on large screens when sidebar is visible. */
    const barNavFromLg = companySidebarLayout;

    const appNav = (
        active: boolean,
        href: string,
        label: string,
        Icon: LucideIcon,
        onNavigate?: () => void,
    ) => (
        <Link
            href={href}
            className={cn(
                buttonVariants({
                    variant: active ? 'secondary' : 'ghost',
                    size: 'sm',
                    className: 'gap-2',
                }),
            )}
            onClick={onNavigate}
        >
            <HeadingIcon icon={Icon} size="sm" />
            {label}
        </Link>
    );

    const mobileNavClass = (active: boolean) =>
        cn(
            buttonVariants({
                variant: active ? 'secondary' : 'ghost',
                size: 'sm',
                className: 'w-full justify-start gap-2 sm:w-auto sm:justify-center',
            }),
        );

    const mobileRow = (
        active: boolean,
        href: string,
        label: string,
        Icon: LucideIcon,
    ) => (
        <Link
            href={href}
            className={mobileNavClass(active)}
            onClick={() => setMobileOpen(false)}
        >
            <HeadingIcon icon={Icon} size="sm" />
            {label}
        </Link>
    );

    const fallbackMobileItems: Array<{
        key: string;
        href: string;
        label: string;
        Icon: LucideIcon;
        active: boolean;
    }> = [
        {
            key: 'dashboard',
            href: route('dashboard'),
            label: 'Dashboard',
            Icon: LayoutDashboard,
            active: onDashboard,
        },
        {
            key: 'members',
            href: route('members.index'),
            label: 'Members',
            Icon: Users,
            active: onMembers,
        },
        {
            key: 'savings',
            href: route('savings.index'),
            label: 'Savings',
            Icon: PiggyBank,
            active: onSavings,
        },
        {
            key: 'loans',
            href: route('loans.index'),
            label: 'Loans',
            Icon: Landmark,
            active: onLoans,
        },
        {
            key: 'financial-statements',
            href: route('financial-statements.index'),
            label: 'Statements',
            Icon: FileSpreadsheet,
            active: onFinancialStatements,
        },
        {
            key: 'profile',
            href: route('profile.edit'),
            label: 'Profile',
            Icon: User,
            active: onProfile,
        },
    ];

    const mobileDrawerItems = useMemo(() => {
        if (!companySidebarLayout) {
            return fallbackMobileItems;
        }

        const profileItem: CompanyNavItem = {
            key: 'profile',
            href: route('profile.edit'),
            label: 'Profile',
            active: onProfile,
            icon: User,
        };

        if (navItems.some((i) => i.key === 'profile')) {
            return navItems;
        }

        return [...navItems, profileItem];
    }, [companySidebarLayout, fallbackMobileItems, navItems, onProfile]);

    const activeCompanyNavItem = useMemo(() => {
        if (!companySidebarLayout) return null;
        if (navItems.length === 0) return null;

        let best: CompanyNavItem | null = null;
        for (const item of navItems) {
            if (!path.startsWith(item.href)) {
                continue;
            }
            if (best === null || item.href.length > best.href.length) {
                best = item;
            }
        }

        return best;
    }, [companySidebarLayout, navItems, path]);

    const breadcrumbs = useMemo((): Crumb[] => {
        const crumbs: Crumb[] = [];

        crumbs.push({
            key: 'home',
            label: 'Dashboard',
            href: route('dashboard'),
            current: false,
        });

        const pushUnique = (c: Crumb) => {
            const last = crumbs[crumbs.length - 1];
            if (last && last.label.toLowerCase() === c.label.toLowerCase()) {
                return;
            }
            crumbs.push(c);
        };

        if (companySidebarLayout && activeCompanyNavItem) {
            pushUnique({
                key: `nav:${activeCompanyNavItem.key}`,
                label: activeCompanyNavItem.label,
                href: activeCompanyNavItem.href,
                current: false,
            });
        }

        // Secondary “section” crumbs for common nested routes (not always represented in the primary nav).
        if (path.startsWith('/loans/')) {
            if (path.includes('/statement')) {
                pushUnique({
                    key: 'loan-statement',
                    label: 'Loan statement',
                    current: false,
                });
            } else if (path.endsWith('/create')) {
                pushUnique({
                    key: 'loan-new',
                    label: 'New loan',
                    current: false,
                });
            } else if (/\/loans\/\d+\/edit$/.test(path)) {
                pushUnique({
                    key: 'loan-edit',
                    label: 'Loan details',
                    current: false,
                });
            }
        }

        if (path.startsWith('/members/')) {
            if (path.endsWith('/create')) {
                pushUnique({
                    key: 'members',
                    label: 'Members',
                    href: route('members.index'),
                    current: false,
                });
                pushUnique({ key: 'member-new', label: 'New member', current: false });
            } else if (path.includes('/end-user/create')) {
                pushUnique({
                    key: 'members',
                    label: 'Members',
                    href: route('members.index'),
                    current: false,
                });
                pushUnique({ key: 'member-invite', label: 'Invite end user', current: false });
            } else if (path.includes('/savings-statement')) {
                pushUnique({
                    key: 'members',
                    label: 'Members',
                    href: route('members.index'),
                    current: false,
                });
                pushUnique({
                    key: 'member-savings-statement',
                    label: 'Savings statement',
                    current: false,
                });
            } else if (/\/members\/\d+\/edit$/.test(path)) {
                pushUnique({
                    key: 'members',
                    label: 'Members',
                    href: route('members.index'),
                    current: false,
                });
                pushUnique({ key: 'member-edit', label: 'Edit member', current: false });
            }
        }

        if (path.startsWith('/savings/')) {
            if (path.endsWith('/create')) {
                pushUnique({
                    key: 'savings',
                    label: 'Savings',
                    href: route('savings.index'),
                    current: false,
                });
                pushUnique({ key: 'saving-new', label: 'Add record', current: false });
            } else if (/\/savings\/\d+\/edit$/.test(path)) {
                pushUnique({
                    key: 'savings',
                    label: 'Savings',
                    href: route('savings.index'),
                    current: false,
                });
                pushUnique({ key: 'saving-edit', label: 'Edit record', current: false });
            }
        }

        if (path.startsWith('/savings-transactions')) {
            pushUnique({
                key: 'savings-ledger',
                label: 'Savings ledger',
                href: route('savings-transactions.index'),
                current: false,
            });
            if (path.endsWith('/create')) {
                pushUnique({ key: 'savings-ledger-new', label: 'New transaction', current: false });
            }
        }

        if (path.startsWith('/journal-vouchers')) {
            pushUnique({
                key: 'journal-vouchers',
                label: 'Journal entries',
                href: route('journal-vouchers.index'),
                current: false,
            });
            if (path.endsWith('/create')) {
                pushUnique({
                    key: 'journal-vouchers-new',
                    label: 'New entry',
                    current: false,
                });
            }
        }

        if (path.startsWith('/account-lookup')) {
            pushUnique({
                key: 'account-lookup',
                label: 'Account lookup',
                href: route('account-lookup.index'),
                current: false,
            });
        }

        if (path.startsWith('/products')) {
            pushUnique({
                key: 'products',
                label: 'Products',
                href: route('products.index'),
                current: false,
            });
            if (path.endsWith('/create')) {
                pushUnique({ key: 'products-new', label: 'New product', current: false });
            } else if (/\/products\/\d+\/edit$/.test(path)) {
                pushUnique({ key: 'products-edit', label: 'Edit product', current: false });
            }
        }

        if (path.startsWith('/chart-of-accounts')) {
            pushUnique({
                key: 'coa',
                label: 'Chart of accounts',
                href: route('chart-of-accounts.index'),
                current: false,
            });
            if (path.endsWith('/create')) {
                pushUnique({ key: 'coa-new', label: 'New account', current: false });
            } else if (/\/chart-of-accounts\/\d+\/edit$/.test(path)) {
                pushUnique({ key: 'coa-edit', label: 'Edit account', current: false });
            }
        }

        if (pageTitle?.trim()) {
            const title = pageTitle.trim();
            const titleKey = title.toLowerCase();

            const matchesActiveNav =
                companySidebarLayout &&
                activeCompanyNavItem &&
                activeCompanyNavItem.label.trim().toLowerCase() === titleKey;

            if (matchesActiveNav) {
                // Keep breadcrumbs compact: don't duplicate the active section label as a final crumb.
            } else {
                const last = crumbs[crumbs.length - 1];
                const already = last?.label.toLowerCase() === titleKey;
                if (!already) {
                    crumbs.push({
                        key: 'page-title',
                        label: title,
                        current: false,
                    });
                }
            }
        }

        crumbs.forEach((c, idx) => {
            const isLast = idx === crumbs.length - 1;
            c.current = isLast;
            if (isLast) {
                c.href = undefined;
            }
        });

        return crumbs;
    }, [activeCompanyNavItem, companySidebarLayout, pageTitle, path]);

    const showPageHeader = useMemo(() => {
        if (pageTitle?.trim()) return true;
        return breadcrumbs.length > 1;
    }, [breadcrumbs.length, pageTitle]);

    const userInitials = useMemo(() => {
        const name = (auth.user?.name ?? '').trim();
        if (!name) return 'U';
        const parts = name.split(/\s+/).filter(Boolean);
        const a = parts[0]?.[0] ?? 'U';
        const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
        return (a + b).toUpperCase();
    }, [auth.user?.name]);

    return (
        <header className="print:hidden sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                <div
                    className={cn(
                        'flex min-w-0 flex-1 items-center gap-2 sm:gap-3',
                        companySidebarLayout && 'lg:hidden',
                    )}
                >
                    <Link
                        href={route('dashboard')}
                        className="shrink-0 font-semibold tracking-tight"
                    >
                        Samuh
                    </Link>
                    <Separator
                        orientation="vertical"
                        className="hidden h-6 sm:block"
                    />
                    {auth.user?.company ? (
                        <span className="text-muted-foreground truncate text-sm">
                            {auth.user.company.name}
                        </span>
                    ) : null}
                </div>

                <nav
                    className={cn(
                        'hidden flex-wrap items-center justify-end gap-1',
                        barNavFromLg ? 'lg:flex lg:ml-auto' : 'sm:flex',
                    )}
                    aria-label="App"
                >
                    {!companySidebarLayout ? (
                        <>
                            {appNav(
                                onDashboard,
                                route('dashboard'),
                                'Dashboard',
                                LayoutDashboard,
                            )}
                            {appNav(
                                onMembers,
                                route('members.index'),
                                'Members',
                                Users,
                            )}
                            {appNav(
                                onSavings,
                                route('savings.index'),
                                'Savings',
                                PiggyBank,
                            )}
                            {appNav(
                                onLoans,
                                route('loans.index'),
                                'Loans',
                                Landmark,
                            )}
                            {appNav(
                                onFinancialStatements,
                                route('financial-statements.index'),
                                'Statements',
                                FileSpreadsheet,
                            )}
                        </>
                    ) : null}
                    <ThemeToggle />
                    {auth.user ? (
                        <HMenu as="div" className="relative ml-1">
                            <MenuButton
                                className={cn(
                                    buttonVariants({
                                        variant: 'outline',
                                        size: 'sm',
                                    }),
                                    'h-9 gap-2 rounded-full pl-1 pr-3',
                                )}
                            >
                                <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-muted/40">
                                    {auth.user.profile_photo_url ? (
                                        <img
                                            src={auth.user.profile_photo_url}
                                            alt={auth.user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-[11px] font-semibold text-foreground/80">
                                            {userInitials}
                                        </span>
                                    )}
                                </span>
                                <span className="max-w-[10rem] truncate text-sm font-medium">
                                    {auth.user.name}
                                </span>
                            </MenuButton>
                            <MenuItems
                                anchor="bottom end"
                                className="z-50 mt-2 w-64 origin-top-right rounded-xl border border-border/70 bg-card p-1 shadow-lg focus:outline-none"
                            >
                                <div className="px-3 py-2">
                                    <p className="truncate text-sm font-semibold text-foreground">
                                        {auth.user.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {auth.user.email}
                                    </p>
                                </div>
                                <Separator className="my-1" />
                                <MenuItem>
                                    {({ close }) => (
                                        <Link
                                            href={route('profile.edit')}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm no-underline transition hover:bg-muted/60 focus:bg-muted/60"
                                            onClick={() => close()}
                                        >
                                            <User className="size-4 text-muted-foreground" aria-hidden />
                                            Profile
                                        </Link>
                                    )}
                                </MenuItem>
                                <MenuItem>
                                    {({ close }) => (
                                        <Link
                                            href={route('profile.edit')}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm no-underline transition hover:bg-muted/60 focus:bg-muted/60"
                                            onClick={() => close()}
                                        >
                                            <User className="size-4 text-muted-foreground" aria-hidden />
                                            Settings
                                        </Link>
                                    )}
                                </MenuItem>
                                <Separator className="my-1" />
                                <MenuItem>
                                    {({ close }) => (
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-muted/60 focus:bg-muted/60"
                                            onClick={() => close()}
                                        >
                                            <LogOut
                                                className="size-4 text-muted-foreground"
                                                aria-hidden
                                            />
                                            Log out
                                        </Link>
                                    )}
                                </MenuItem>
                            </MenuItems>
                        </HMenu>
                    ) : null}
                </nav>

                <div
                    className={cn(
                        'flex items-center',
                        barNavFromLg ? 'lg:hidden' : 'sm:hidden',
                    )}
                >
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-expanded={mobileOpen}
                        aria-controls="app-mobile-menu"
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu className="size-5" />
                    </Button>
                </div>
            </div>

            {showPageHeader ? (
                <div className="border-t border-border/60 bg-background/70">
                    <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
                        <nav
                            className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs sm:text-sm"
                            aria-label="Breadcrumb"
                        >
                            {breadcrumbs.map((c, idx) => (
                                <span
                                    key={c.key}
                                    className="flex min-w-0 items-center gap-1"
                                >
                                    {c.href && !c.current ? (
                                        <Link
                                            href={c.href}
                                            className="truncate underline-offset-4 hover:text-foreground hover:underline"
                                        >
                                            {c.label}
                                        </Link>
                                    ) : (
                                        <span
                                            className={cn(
                                                'truncate',
                                                c.current
                                                    ? 'font-medium text-foreground'
                                                    : 'text-muted-foreground',
                                            )}
                                            aria-current={c.current ? 'page' : undefined}
                                        >
                                            {c.label}
                                        </span>
                                    )}
                                    {idx < breadcrumbs.length - 1 ? (
                                        <ChevronRight
                                            className="size-3.5 shrink-0 opacity-60"
                                            aria-hidden
                                        />
                                    ) : null}
                                </span>
                            ))}
                        </nav>

                        {pageTitle?.trim() ? (
                            <h1 className="mt-2 flex items-center gap-2.5 text-lg font-semibold tracking-tight sm:mt-2.5 sm:text-xl sm:gap-3">
                                {PageTitleIcon ? (
                                    <HeadingIcon
                                        icon={PageTitleIcon}
                                        size="md"
                                        className="text-foreground/80"
                                    />
                                ) : null}
                                <span className="min-w-0 truncate">{pageTitle.trim()}</span>
                            </h1>
                        ) : null}
                    </div>
                </div>
            ) : null}

            <Dialog
                open={mobileOpen}
                onClose={setMobileOpen}
                className={cn(
                    'relative z-50',
                    barNavFromLg ? 'lg:hidden' : 'sm:hidden',
                )}
            >
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm transition duration-200 data-closed:opacity-0"
                />
                <div className="fixed inset-0 flex justify-end p-2 pt-14">
                    <DialogPanel
                        transition
                        className="flex max-h-[min(100dvh-4rem,28rem)] w-full max-w-xs flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg transition duration-200 data-closed:translate-x-4 data-closed:opacity-0"
                        id="app-mobile-menu"
                    >
                        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                            <DialogTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
                                <Menu
                                    className="size-5 shrink-0 text-muted-foreground"
                                    aria-hidden
                                />
                                Menu
                            </DialogTitle>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Close menu"
                                onClick={() => setMobileOpen(false)}
                            >
                                <X className="size-5" />
                            </Button>
                        </div>
                        <nav
                            className="flex flex-col gap-1 p-3"
                            aria-label="Mobile app"
                        >
                            {companySidebarLayout
                                ? mobileDrawerItems.map((item) => (
                                      <Link
                                          key={item.key}
                                          href={item.href}
                                          className={mobileNavClass(item.active)}
                                          onClick={() => setMobileOpen(false)}
                                      >
                                          <HeadingIcon icon={item.icon} size="sm" />
                                          {item.label}
                                      </Link>
                                  ))
                                : mobileDrawerItems.map((item) =>
                                      mobileRow(
                                          item.active,
                                          item.href,
                                          item.label,
                                          item.Icon,
                                      ),
                                  )}
                            {auth.user ? (
                                <div className="mt-2 rounded-xl border border-border/70 bg-muted/20 p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-muted/40">
                                            {auth.user.profile_photo_url ? (
                                                <img
                                                    src={auth.user.profile_photo_url}
                                                    alt={auth.user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xs font-semibold text-foreground/80">
                                                    {userInitials}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {auth.user.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {auth.user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <Link
                                            href={route('profile.edit')}
                                            className={cn(
                                                buttonVariants({
                                                    variant: 'outline',
                                                    size: 'sm',
                                                }),
                                                'w-full justify-center gap-2',
                                            )}
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <User className="size-4 text-muted-foreground" aria-hidden />
                                            Profile
                                        </Link>
                                        <Link
                                            href={route('profile.edit')}
                                            className={cn(
                                                buttonVariants({
                                                    variant: 'outline',
                                                    size: 'sm',
                                                }),
                                                'w-full justify-center gap-2',
                                            )}
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <User className="size-4 text-muted-foreground" aria-hidden />
                                            Settings
                                        </Link>
                                    </div>
                                </div>
                            ) : null}
                            <div className="pt-1">
                                <ThemeToggle
                                    size="sm"
                                    className="w-full justify-center"
                                    label="Toggle theme"
                                />
                            </div>
                            <Separator className="my-2" />
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className={cn(
                                    buttonVariants({
                                        variant: 'outline',
                                        className:
                                            'w-full justify-center gap-2 font-normal',
                                    }),
                                )}
                                onClick={() => setMobileOpen(false)}
                            >
                                <LogOut
                                    className="size-4 shrink-0 text-muted-foreground"
                                    aria-hidden
                                />
                                Log out
                            </Link>
                        </nav>
                    </DialogPanel>
                </div>
            </Dialog>
        </header>
    );
}
