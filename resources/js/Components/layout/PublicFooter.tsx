import { HeadingIcon } from '@/components/ui/heading-icon';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Building2, Package, Shield, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type PublicFooterProps = {
    variant?: 'full' | 'compact';
    className?: string;
};

const year = new Date().getFullYear();

export default function PublicFooter({
    variant = 'full',
    className,
}: PublicFooterProps) {
    if (variant === 'compact') {
        return (
            <footer
                className={cn(
                    'print:hidden border-t border-border/60 bg-muted/20 py-6 text-center',
                    className,
                )}
            >
                <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 text-muted-foreground text-sm sm:flex-row sm:justify-center sm:gap-6">
                    <p>© {year} Samuh</p>
                    <span className="hidden text-border sm:inline">·</span>
                    <Link
                        href={route('marketing.contact')}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Contact
                    </Link>
                    <span className="hidden text-border sm:inline">·</span>
                    <Link
                        href={route('home')}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Home
                    </Link>
                </div>
            </footer>
        );
    }

    return (
        <footer
            className={cn(
                'print:hidden border-t border-border/60 bg-muted/25 dark:bg-muted/10',
                className,
            )}
        >
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link
                            href={route('home')}
                            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
                        >
                            <Sparkles
                                className="text-muted-foreground size-5 shrink-0"
                                aria-hidden
                            />
                            Samuh
                        </Link>
                        <p className="text-muted-foreground mt-3 max-w-xs text-sm leading-relaxed">
                            Multi-tenant tools for savings groups and
                            co-operatives — transparent accounting your members
                            can trust.
                        </p>
                    </div>
                    <FooterCol title="Product" icon={Package}>
                        <FooterLink href={route('marketing.features')}>
                            Features
                        </FooterLink>
                        <FooterLink href={route('marketing.pricing')}>
                            Pricing
                        </FooterLink>
                        <FooterLink href={route('reviews.index')}>
                            Reviews
                        </FooterLink>
                        <FooterLink href={route('login')}>
                            Company portal
                        </FooterLink>
                    </FooterCol>
                    <FooterCol title="Company" icon={Building2}>
                        <FooterLink href={route('marketing.about')}>
                            About
                        </FooterLink>
                        <FooterLink href={route('marketing.contact')}>
                            Contact
                        </FooterLink>
                        <FooterLink href={route('home')}>Home</FooterLink>
                    </FooterCol>
                    <FooterCol title="Staff" icon={Shield}>
                        <FooterLink href="/admin/login">Admin login</FooterLink>
                    </FooterCol>
                </div>
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-muted-foreground text-sm sm:flex-row">
                    <p>© {year} Samuh. All rights reserved.</p>
                    <p className="text-center sm:text-end">
                        Built for co-operative organizations.
                    </p>
                </div>
            </div>
        </footer>
    );
}

function FooterCol({
    title,
    icon,
    children,
}: {
    title: string;
    icon: LucideIcon;
    children: ReactNode;
}) {
    return (
        <div>
            <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold tracking-wide">
                <HeadingIcon
                    icon={icon}
                    size="sm"
                    className="text-foreground/70"
                />
                {title}
            </h2>
            <ul className="mt-4 flex flex-col gap-3">{children}</ul>
        </div>
    );
}

function FooterLink({
    href,
    children,
}: {
    href: string;
    children: ReactNode;
}) {
    const external = href.startsWith('http') || href.startsWith('/admin');
    if (external) {
        return (
            <li>
                <a
                    href={href}
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                >
                    {children}
                </a>
            </li>
        );
    }
    return (
        <li>
            <Link
                href={href}
                className="text-muted-foreground text-sm transition-colors hover:text-foreground"
            >
                {children}
            </Link>
        </li>
    );
}
