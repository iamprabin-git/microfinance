import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from '@headlessui/react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

type AppHeaderProps = {
    /** When true, coop modules live in the sidebar; desktop header omits those links. */
    companySidebarLayout?: boolean;
};

export default function AppHeader({
    companySidebarLayout = false,
}: AppHeaderProps) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const [mobileOpen, setMobileOpen] = useState(false);

    const path = url.split('?')[0] ?? url;
    const onDashboard = path === '/dashboard';
    const onGroups = path.startsWith('/groups');
    const onMembers = path.startsWith('/members');
    const onSavings = path.startsWith('/savings');
    const onLoans = path.startsWith('/loans');
    const onProfile = path.startsWith('/profile');

    /** Below this breakpoint the drawer lists all routes; bar shows Profile/Logout only on large screens when sidebar is visible. */
    const barNavFromLg = companySidebarLayout;

    const appNav = (
        active: boolean,
        href: string,
        label: string,
        onNavigate?: () => void,
    ) => (
        <Link
            href={href}
            className={cn(
                buttonVariants({
                    variant: active ? 'secondary' : 'ghost',
                    size: 'sm',
                }),
            )}
            onClick={onNavigate}
        >
            {label}
        </Link>
    );

    const navButton = (active: boolean) =>
        cn(
            buttonVariants({
                variant: active ? 'secondary' : 'ghost',
                size: 'sm',
                className: 'w-full justify-start sm:w-auto sm:justify-center',
            }),
        );

    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
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
                            )}
                            {appNav(onGroups, route('groups.index'), 'Groups')}
                            {appNav(
                                onMembers,
                                route('members.index'),
                                'Members',
                            )}
                            {appNav(
                                onSavings,
                                route('savings.index'),
                                'Savings',
                            )}
                            {appNav(onLoans, route('loans.index'), 'Loans')}
                        </>
                    ) : null}
                    {appNav(onProfile, route('profile.edit'), 'Profile')}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={cn(
                            buttonVariants({
                                variant: 'outline',
                                size: 'sm',
                            }),
                        )}
                    >
                        Log out
                    </Link>
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
                            <DialogTitle className="text-base font-semibold tracking-tight">
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
                            <Link
                                href={route('dashboard')}
                                className={navButton(onDashboard)}
                                onClick={() => setMobileOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href={route('groups.index')}
                                className={navButton(onGroups)}
                                onClick={() => setMobileOpen(false)}
                            >
                                Groups
                            </Link>
                            <Link
                                href={route('members.index')}
                                className={navButton(onMembers)}
                                onClick={() => setMobileOpen(false)}
                            >
                                Members
                            </Link>
                            <Link
                                href={route('savings.index')}
                                className={navButton(onSavings)}
                                onClick={() => setMobileOpen(false)}
                            >
                                Savings
                            </Link>
                            <Link
                                href={route('loans.index')}
                                className={navButton(onLoans)}
                                onClick={() => setMobileOpen(false)}
                            >
                                Loans
                            </Link>
                            <Link
                                href={route('profile.edit')}
                                className={navButton(onProfile)}
                                onClick={() => setMobileOpen(false)}
                            >
                                Profile
                            </Link>
                            <Separator className="my-2" />
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className={cn(
                                    buttonVariants({
                                        variant: 'outline',
                                        className: 'w-full justify-center',
                                    }),
                                )}
                                onClick={() => setMobileOpen(false)}
                            >
                                Log out
                            </Link>
                        </nav>
                    </DialogPanel>
                </div>
            </Dialog>
        </header>
    );
}
