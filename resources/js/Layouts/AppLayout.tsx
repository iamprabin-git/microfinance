import AppFooter from '@/components/layout/AppFooter';
import AppHeader from '@/components/layout/AppHeader';
import PrintPageButton from '@/components/layout/PrintPageButton';
import CompanySidebarNav, {
    buildCompanyNavItems,
} from '@/components/layout/CompanySidebarNav';
import { buttonVariants } from '@/components/ui/button';
import { HeadingIcon } from '@/components/ui/heading-icon';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { LogOut, type LucideIcon, User } from 'lucide-react';
import type { ReactNode } from 'react';

type AppLayoutProps = {
    title?: string;
    /** Shown before the page title in the main h1. */
    titleIcon?: LucideIcon;
    /** When false, show the in-page print control (financial statements, loans, savings). */
    hidePrint?: boolean;
    children: ReactNode;
};

export default function AppLayout({
    title,
    titleIcon: TitleIcon,
    hidePrint = true,
    children,
}: AppLayoutProps) {
    const { auth, companyPortal } = usePage().props;
    const { url } = usePage();
    const path = url.split('?')[0] ?? url;
    const company = auth.user?.company;
    const useCompanySidebar = Boolean(company);
    const navItems = useCompanySidebar
        ? buildCompanyNavItems(path, {
              isEndUser: companyPortal?.isEndUser ?? false,
          })
        : [];

    return (
        <div
            className={cn(
                'min-h-screen bg-background',
                useCompanySidebar && 'lg:flex',
            )}
        >
            {useCompanySidebar ? (
                <aside
                    className="print:hidden border-border/60 bg-background hidden w-56 shrink-0 flex-col border-r lg:flex"
                    aria-label="Company navigation"
                >
                    <div className="border-border/60 border-b px-4 py-4">
                        <Link
                            href={route('dashboard')}
                            className="font-semibold tracking-tight"
                        >
                            Samuh
                        </Link>
                        <p className="text-muted-foreground mt-1 truncate text-sm">
                            {company!.name}
                        </p>
                    </div>
                    <div className="flex flex-1 flex-col overflow-y-auto p-3">
                        <CompanySidebarNav items={navItems} />
                    </div>
                    <div className="border-border/60 space-y-0.5 border-t p-3">
                        <Link
                            href={route('profile.edit')}
                            className={cn(
                                buttonVariants({
                                    variant: path.startsWith('/profile')
                                        ? 'secondary'
                                        : 'ghost',
                                    size: 'sm',
                                    className:
                                        'w-full justify-start gap-2 font-normal',
                                }),
                            )}
                        >
                            <HeadingIcon icon={User} size="sm" />
                            Profile
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className={cn(
                                buttonVariants({
                                    variant: 'outline',
                                    size: 'sm',
                                    className:
                                        'w-full justify-center gap-2 font-normal',
                                }),
                            )}
                        >
                            <LogOut className="size-4 shrink-0 opacity-70" aria-hidden />
                            Log out
                        </Link>
                    </div>
                </aside>
            ) : null}

            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                <AppHeader companySidebarLayout={useCompanySidebar} />
                <main
                    className={cn(
                        'mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8',
                        'print:max-w-none print:px-8 print:py-6',
                    )}
                >
                    {!hidePrint ? (
                        <div className="print:hidden -mt-1 mb-4 flex justify-end sm:mb-5">
                            <PrintPageButton />
                        </div>
                    ) : null}
                    {title ? (
                        <h1 className="mb-5 flex items-center gap-2.5 text-2xl font-semibold tracking-tight sm:mb-6 sm:gap-3">
                            {TitleIcon ? (
                                <HeadingIcon
                                    icon={TitleIcon}
                                    size="lg"
                                    className="text-foreground/80"
                                />
                            ) : null}
                            {title}
                        </h1>
                    ) : null}
                    {children}
                </main>
                <AppFooter companySidebarLayout={useCompanySidebar} />
            </div>
        </div>
    );
}
