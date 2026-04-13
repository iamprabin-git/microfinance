import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type MarketingHeroProps = {
    title: string;
    subtitle?: string | null;
    /** Optional wide image URL; falls back to gradient + pattern when missing */
    imageUrl?: string | null;
    /** Extra content under subtitle (e.g. CTAs) */
    children?: ReactNode;
    className?: string;
};

export default function MarketingHero({
    title,
    subtitle,
    imageUrl,
    children,
    className,
}: MarketingHeroProps) {
    return (
        <section
            className={cn(
                'relative isolate overflow-hidden border-b border-border/60 bg-muted/30',
                className,
            )}
        >
            <div
                className={cn(
                    'absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-sky-500/10',
                    imageUrl ? 'opacity-90' : 'opacity-100',
                )}
                aria-hidden
            />
            {imageUrl ? (
                <div
                    className="absolute inset-0 opacity-[0.22] mix-blend-multiply dark:opacity-[0.35] dark:mix-blend-soft-light"
                    style={{
                        backgroundImage: `url("${imageUrl.replace(/"/g, '%22')}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                    aria-hidden
                />
            ) : (
                <div
                    className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 20% 20%, currentColor 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                    aria-hidden
                />
            )}
            <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                        {title}
                    </h1>
                    {subtitle ? (
                        <p className="text-muted-foreground mt-5 text-balance text-lg leading-relaxed sm:text-xl">
                            {subtitle}
                        </p>
                    ) : null}
                    {children ? (
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            {children}
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
