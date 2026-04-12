import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

const navLinkClass =
    'text-muted-foreground hover:text-foreground text-sm font-medium transition-colors';

type PublicLayoutProps = {
    title?: string;
    children: ReactNode;
};

export default function PublicLayout({ title, children }: PublicLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="border-b bg-card">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                    <Link
                        href={route('home')}
                        className="text-lg font-semibold tracking-tight"
                    >
                        Samuh
                    </Link>
                    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <Link href={route('home')} className={navLinkClass}>
                            Home
                        </Link>
                        <Link
                            href={route('marketing.about')}
                            className={navLinkClass}
                        >
                            About
                        </Link>
                        <Link
                            href={route('marketing.pricing')}
                            className={navLinkClass}
                        >
                            Pricing
                        </Link>
                        <Link
                            href={route('marketing.contact')}
                            className={navLinkClass}
                        >
                            Contact
                        </Link>
                        <Link href={route('reviews.index')} className={navLinkClass}>
                            Reviews
                        </Link>
                        <Link
                            href={route('login')}
                            className={cn(buttonVariants({ size: 'sm' }))}
                        >
                            Company sign in
                        </Link>
                        <a
                            href="/admin/login"
                            className={cn(
                                buttonVariants({ variant: 'outline', size: 'sm' }),
                            )}
                        >
                            Admin
                        </a>
                    </nav>
                </div>
            </header>
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
                {title ? (
                    <h1 className="mb-8 text-3xl font-semibold tracking-tight">
                        {title}
                    </h1>
                ) : null}
                {children}
            </main>
            <footer className="border-t py-6 text-center text-muted-foreground text-sm">
                Samuh — group accounting for cooperatives
            </footer>
        </div>
    );
}
