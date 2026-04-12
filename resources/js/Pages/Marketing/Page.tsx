import PublicLayout from '@/Layouts/PublicLayout';
import type { MarketingPageProps } from '@/types/models';
import { Head } from '@inertiajs/react';

export default function Page({ page }: MarketingPageProps) {
    return (
        <PublicLayout title={page.title}>
            <Head title={page.title} />
            {page.subtitle ? (
                <p className="text-muted-foreground -mt-4 mb-8 text-lg">
                    {page.subtitle}
                </p>
            ) : null}
            <div className="text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">
                {page.body}
            </div>
        </PublicLayout>
    );
}
