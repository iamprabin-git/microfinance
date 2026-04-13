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
import type { PaginatedReviews, PublicReviewRow } from '@/types/models';
import { Head, Link, usePage } from '@inertiajs/react';
import { Star as StarIcon } from 'lucide-react';

function Stars({ count }: { count: number }) {
    const n = Math.min(5, Math.max(0, Number(count) || 0));
    return (
        <span className="text-amber-600 dark:text-amber-400" aria-hidden>
            {'★'.repeat(n)}
            {'☆'.repeat(5 - n)}
        </span>
    );
}

function isPaginated(
    reviews: PaginatedReviews | PublicReviewRow[],
): reviews is PaginatedReviews {
    return (
        typeof reviews === 'object' &&
        reviews !== null &&
        'data' in reviews &&
        Array.isArray((reviews as PaginatedReviews).data)
    );
}

type ReviewsProps = {
    reviews: PaginatedReviews | PublicReviewRow[];
};

export default function Reviews({ reviews }: ReviewsProps) {
    const { flash } = usePage().props;

    const rows = isPaginated(reviews)
        ? reviews.data
        : (reviews ?? []);
    const prevUrl = isPaginated(reviews)
        ? reviews.prev_page_url
        : null;
    const nextUrl = isPaginated(reviews)
        ? reviews.next_page_url
        : null;

    return (
        <PublicLayout title="Reviews" titleIcon={StarIcon}>
            <Head title="Reviews" />

            {flash?.status ? (
                <p className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                    {flash.status}
                </p>
            ) : null}

            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                    Reviews from signed-in company users. New submissions are
                    approved by platform staff.
                </p>
                <Link
                    href={route('reviews.create')}
                    className={cn(buttonVariants())}
                >
                    Write a review
                </Link>
            </div>

            {rows.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    No published reviews yet.
                </p>
            ) : (
                <div className="space-y-4">
                    {rows.map((r) => (
                        <Card key={r.id}>
                            <CardHeader className="pb-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <HeadingIcon icon={StarIcon} size="sm" />
                                        {r.title || 'Review'}
                                    </CardTitle>
                                    <Stars count={r.rating} />
                                </div>
                                <CardDescription>{r.author}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {r.body}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {(prevUrl || nextUrl) && (
                <div className="mt-8 flex justify-center gap-3">
                    {prevUrl ? (
                        <Link
                            href={prevUrl}
                            preserveScroll
                            className={cn(
                                buttonVariants({ variant: 'outline' }),
                            )}
                        >
                            Previous
                        </Link>
                    ) : null}
                    {nextUrl ? (
                        <Link
                            href={nextUrl}
                            preserveScroll
                            className={cn(
                                buttonVariants({ variant: 'outline' }),
                            )}
                        >
                            Next
                        </Link>
                    ) : null}
                </div>
            )}
        </PublicLayout>
    );
}
