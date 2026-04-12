import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

const year = new Date().getFullYear();

type AppFooterProps = {
    className?: string;
    /** When true, module links are in the sidebar; footer omits duplicate coop links. */
    companySidebarLayout?: boolean;
};

export default function AppFooter({
    className,
    companySidebarLayout = false,
}: AppFooterProps) {
    return (
        <footer
            className={cn(
                'mt-auto border-t border-border/60 bg-muted/20 dark:bg-muted/10',
                className,
            )}
        >
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <p className="font-semibold tracking-tight">Portal</p>
                        <ul className="mt-4 flex flex-col gap-2.5 text-muted-foreground text-sm">
                            <li>
                                <Link
                                    href={route('dashboard')}
                                    className="transition-colors hover:text-foreground"
                                >
                                    Dashboard
                                </Link>
                            </li>
                            {!companySidebarLayout ? (
                                <>
                                    <li>
                                        <Link
                                            href={route('groups.index')}
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Groups
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('members.index')}
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Members
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('savings.index')}
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Savings
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('loans.index')}
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Loans
                                        </Link>
                                    </li>
                                </>
                            ) : null}
                            <li>
                                <Link
                                    href={route('profile.edit')}
                                    className="transition-colors hover:text-foreground"
                                >
                                    Profile & security
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold tracking-tight">Samuh</p>
                        <ul className="mt-4 flex flex-col gap-2.5 text-muted-foreground text-sm">
                            <li>
                                <Link
                                    href={route('home')}
                                    className="transition-colors hover:text-foreground"
                                >
                                    Marketing site
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route('marketing.contact')}
                                    className="transition-colors hover:text-foreground"
                                >
                                    Contact support
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route('reviews.index')}
                                    className="transition-colors hover:text-foreground"
                                >
                                    Public reviews
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                        <p className="font-semibold tracking-tight">Signed in</p>
                        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                            You are using the company workspace. For billing,
                            users, and platform settings, staff use the separate
                            admin console.
                        </p>
                    </div>
                </div>
                <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-8 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p>© {year} Samuh</p>
                    <p className="text-xs sm:text-sm">
                        Company portal · Inertia & Laravel
                    </p>
                </div>
            </div>
        </footer>
    );
}
