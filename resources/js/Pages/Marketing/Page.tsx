import MarketingHero from '@/Components/marketing/MarketingHero';
import PublicLayout from '@/Layouts/PublicLayout';
import type { MarketingPageProps } from '@/types/models';
import { Head } from '@inertiajs/react';

export default function Page({ page }: MarketingPageProps) {
    const description =
        page.meta_description?.trim() ||
        page.subtitle ||
        `${page.title} — Samuh co-operative finance.`;

    return (
        <PublicLayout
            hero={
                <MarketingHero
                    title={page.title}
                    subtitle={page.subtitle}
                    imageUrl={page.hero_image_url}
                />
            }
        >
            <Head title={page.title}>
                {page.meta_description ? (
                    <meta name="description" content={page.meta_description} />
                ) : (
                    <meta name="description" content={description} />
                )}
                <meta property="og:title" content={page.title} />
                <meta property="og:description" content={description} />
                {page.hero_image_url ? (
                    <meta
                        property="og:image"
                        content={page.hero_image_url}
                    />
                ) : null}
            </Head>

            <article className="mx-auto max-w-3xl">
                <div className="rounded-2xl border border-border/70 bg-card/40 p-6 shadow-sm backdrop-blur-sm sm:p-10">
                    {page.body ? (
                        <div className="prose prose-neutral dark:prose-invert prose-p:leading-relaxed max-w-none text-foreground">
                            <div className="whitespace-pre-wrap text-base leading-relaxed">
                                {page.body}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center text-sm">
                            Content for this page has not been published yet.
                        </p>
                    )}
                </div>
            </article>
        </PublicLayout>
    );
}
