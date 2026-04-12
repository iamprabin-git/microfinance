import { buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import PublicLayout from '@/Layouts/PublicLayout';
import { cn } from '@/lib/utils';
import type { MarketingPageContent, PublicReviewRow } from '@/types/models';
import { Head, Link } from '@inertiajs/react';

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

export default function Welcome({
    canLogin,
    page,
    reviews = [],
}: WelcomeProps) {
    const heading = page?.title ?? 'Samuh';
    const subtitle =
        page?.subtitle ??
        'Multi-tenant group accounting — Laravel, Inertia, React, and shadcn/ui.';
    const body = page?.body ?? '';

    return (
        <PublicLayout>
            <Head title={heading} />

            <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-semibold tracking-tight">
                    {heading}
                </h1>
                <p className="text-muted-foreground mt-3 text-lg">{subtitle}</p>
                {body ? (
                    <p className="text-muted-foreground mt-6 whitespace-pre-wrap text-left text-base leading-relaxed">
                        {body}
                    </p>
                ) : null}
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {canLogin ? (
                        <Link
                            href={route('login')}
                            className={cn(buttonVariants({ size: 'lg' }))}
                        >
                            Company sign in
                        </Link>
                    ) : null}
                    <Link
                        href={route('reviews.index')}
                        className={cn(
                            buttonVariants({ variant: 'outline', size: 'lg' }),
                        )}
                    >
                        Reviews
                    </Link>
                </div>
            </div>

            {reviews.length > 0 ? (
                <section className="mt-16">
                    <h2 className="mb-6 text-center text-xl font-semibold tracking-tight">
                        What members say
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {reviews.map((r) => (
                            <Card key={r.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <CardTitle className="text-base">
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
                    <p className="mt-6 text-center">
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
