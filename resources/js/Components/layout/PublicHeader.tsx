import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from '@headlessui/react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useMemo, useState } from 'react';

function navHrefActive(currentUrl: string, href: string): boolean {
    const path = href.replace(/^https?:\/\/[^/]+/, '') || '/';
    if (path === '/') {
        return currentUrl === '/' || currentUrl === '';
    }
    return currentUrl === path || currentUrl.startsWith(`${path}/`);
}

export default function PublicHeader() {
    const { url, props } = usePage();
    const auth = props.auth;
    const [mobileOpen, setMobileOpen] = useState(false);
    const path = url.split('?')[0] ?? url;

    const links = useMemo(
        () =>
            [
                { href: route('home'), label: 'Home' },
                { href: route('marketing.features'), label: 'Features' },
                { href: route('marketing.about'), label: 'About' },
                { href: route('marketing.pricing'), label: 'Pricing' },
                { href: route('marketing.contact'), label: 'Contact' },
                { href: route('reviews.index'), label: 'Reviews' },
            ] as const,
        [],
    );

    const linkClass = (href: string) =>
        cn(
            'text-sm font-medium transition-colors',
            navHrefActive(path, href)
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
        );

    return (
        <header className="print:hidden sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
                <Link
                    href={route('home')}
                    className="group flex shrink-0 flex-col gap-0 leading-none"
                    onClick={() => setMobileOpen(false)}
                >
                    <span className="text-lg font-semibold tracking-tight transition-colors group-hover:text-primary sm:text-xl">
                        Samuh
                    </span>
                    <span className="text-muted-foreground hidden text-[0.65rem] font-medium uppercase tracking-widest sm:inline">
                        Co-operative finance
                    </span>
                </Link>

                <nav
                    className="text-muted-foreground hidden items-center gap-1 md:flex lg:gap-2"
                    aria-label="Primary"
                >
                    {links.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                linkClass(href),
                                'rounded-md px-2.5 py-2 lg:px-3',
                            )}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className={cn(buttonVariants({ size: 'sm' }))}
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className={cn(buttonVariants({ size: 'sm' }))}
                        >
                            Company sign in
                        </Link>
                    )}
                    <a
                        href="/admin/login"
                        className={cn(
                            buttonVariants({ variant: 'outline', size: 'sm' }),
                        )}
                    >
                        Admin
                    </a>
                </div>

                <div className="flex items-center gap-2 md:hidden">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className={cn(buttonVariants({ size: 'sm' }))}
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className={cn(buttonVariants({ size: 'sm' }))}
                        >
                            Sign in
                        </Link>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="shrink-0"
                        aria-expanded={mobileOpen}
                        aria-controls="public-mobile-menu"
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
                className="relative z-[60] md:hidden"
            >
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm transition duration-200 data-closed:opacity-0"
                />
                <div className="fixed inset-0 flex justify-end p-2 pt-14 sm:p-3 sm:pt-16">
                    <DialogPanel
                        transition
                        className="flex max-h-[min(100dvh-5rem,32rem)] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg transition duration-200 data-closed:translate-x-4 data-closed:opacity-0"
                        id="public-mobile-menu"
                    >
                        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                            <DialogTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
                                <Menu
                                    className="text-muted-foreground size-5 shrink-0"
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
                            className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3"
                            aria-label="Mobile primary"
                        >
                            {links.map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        'rounded-xl px-4 py-3 text-base font-medium transition-colors',
                                        navHrefActive(path, href)
                                            ? 'bg-muted text-foreground'
                                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                    )}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>
                        <div className="border-t border-border/60 bg-muted/30 p-4">
                            <a
                                href="/admin/login"
                                className={cn(
                                    buttonVariants({
                                        variant: 'outline',
                                        className: 'w-full',
                                    }),
                                )}
                                onClick={() => setMobileOpen(false)}
                            >
                                Admin login
                            </a>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </header>
    );
}
