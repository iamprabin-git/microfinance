import MarketingHero from '@/Components/marketing/MarketingHero';
import { buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { HeadingIcon } from '@/components/ui/heading-icon';
import PublicLayout from '@/Layouts/PublicLayout';
import { cn } from '@/lib/utils';
import type { MarketingPageContent, PublicReviewRow } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import {
    BarChart3,
    Landmark,
    MessageCircle,
    ShieldCheck,
    Sparkles,
    Star,
    Users,
} from 'lucide-react';

function Stars({ count }: { count: number }) {
    const n = Math.min(5, Math.max(0, Number(count) || 0));
    return (
        <span className="text-amber-600 dark:text-amber-400" aria-hidden>
            {'★'.repeat(n)}
            {'☆'.repeat(5 - n)}
        </span>
    );
}

type WelcomeProps = {
    canLogin: boolean;
    page?: MarketingPageContent;
    reviews?: PublicReviewRow[];
};

const highlights = [
    {
        title: 'Members & savings',
        description:
            'Onboard members, record monthly deposits, and keep balances clear for every group.',
        href: route('marketing.features'),
        icon: Users,
    },
    {
        title: 'Loans & repayments',
        description:
            'Structured lending workflows with schedules your committee can audit at a glance.',
        href: route('marketing.features'),
        icon: Landmark,
    },
    {
        title: 'Financial statements',
        description:
            'Export-ready views for boards, regulators, and annual reporting cycles.',
        href: route('marketing.pricing'),
        icon: BarChart3,
    },
    {
        title: 'Roles & approvals',
        description:
            'Company admins, staff, and read-only roles — plus platform verification before go-live.',
        href: route('marketing.about'),
        icon: ShieldCheck,
    },
] as const;

export default function Welcome({
    canLogin,
    page,
    reviews = [],
}: WelcomeProps) {
    const heading = page?.title ?? 'Samuh';
    const subtitle =
        page?.subtitle ??
        'Multi-tenant group accounting built for savings co-operatives.';
    const body = page?.body ?? '';
    const metaDescription =
        page?.meta_description?.trim() ||
        `${heading} — transparent savings, loans, and reporting for co-operatives.`;

    return (
        <PublicLayout
            hero={
                <MarketingHero
                    title={heading}
                    subtitle={subtitle}
                    imageUrl={page?.hero_image_url}
                >
                    {canLogin ? (
                        <Link
                            href={route('login')}
                            className={cn(buttonVariants({ size: 'lg' }))}
                        >
                            Company sign in
                        </Link>
                    ) : null}
                    <Link
                        href={route('marketing.features')}
                        className={cn(
                            buttonVariants({ variant: 'outline', size: 'lg' }),
                        )}
                    >
                        Explore features
                    </Link>
                    <Link
                        href={route('reviews.index')}
                        className={cn(
                            buttonVariants({ variant: 'outline', size: 'lg' }),
                        )}
                    >
                        Reviews
                    </Link>
                </MarketingHero>
            }
        >
            <Head title={heading}>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={heading} />
                <meta property="og:description" content={metaDescription} />
                {page?.hero_image_url ? (
                    <meta
                        property="og:image"
                        content={page.hero_image_url}
                    />
                ) : null}
            </Head>

            {body ? (
                <section className="mx-auto max-w-3xl">
                    <div className="rounded-2xl border border-border/70 bg-card/30 p-6 text-center sm:p-8">
                        <div className="flex justify-center">
                            <Sparkles
                                className="text-primary size-8"
                                aria-hidden
                            />
                        </div>
                        <div className="text-muted-foreground mt-4 whitespace-pre-wrap text-left text-base leading-relaxed">
                            {body}
                        </div>
                    </div>
                </section>
            ) : null}

            <section className="mx-auto mt-16 max-w-5xl">
                <h2 className="text-center text-2xl font-semibold tracking-tight">
                    Built for transparent co-operative finance
                </h2>
                <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed sm:text-base">
                    A single workspace for committees, treasurers, and members —
                    with a polished public site you can tune from the admin panel.
                </p>
                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {highlights.map((item) => (
                        <Link
                            key={item.title}
                            href={item.href}
                            className="group rounded-2xl border border-border/70 bg-card/40 p-5 shadow-sm transition hover:border-primary/35 hover:shadow-md"
                        >
                            <HeadingIcon
                                icon={item.icon}
                                size="md"
                                className="text-primary"
                            />
                            <h3 className="mt-3 font-semibold tracking-tight group-hover:text-primary">
                                {item.title}
                            </h3>
                            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            {reviews.length > 0 ? (
                <section className="mx-auto mt-20 max-w-5xl">
                    <h2 className="mb-8 flex items-center justify-center gap-2 text-center text-2xl font-semibold tracking-tight">
                        <MessageCircle
                            className="text-muted-foreground size-6 shrink-0"
                            aria-hidden
                        />
                        What members say
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {reviews.map((r) => (
                            <Card key={r.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <HeadingIcon icon={Star} size="sm" />
                                            {r.title || 'Review'}
                                        </CardTitle>
                                        <Stars count={r.rating} />
                                    </div>
                                    <CardDescription>{r.author}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                                        {r.body}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <p className="mt-8 text-center">
                        <Link
                            href={route('reviews.index')}
                            className={cn(
                                buttonVariants({ variant: 'link', size: 'sm' }),
                                'h-auto p-0',
                            )}
                        >
                            All reviews
                        </Link>
                    </p>
                </section>
            ) : null}
        </PublicLayout>
    );
}
