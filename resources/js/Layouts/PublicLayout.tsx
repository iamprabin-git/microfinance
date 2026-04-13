import PublicFooter from '@/components/layout/PublicFooter';
import PublicHeader from '@/components/layout/PublicHeader';
import { HeadingIcon } from '@/components/ui/heading-icon';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type PublicLayoutProps = {
    title?: string;
    titleIcon?: LucideIcon;
    /** Full-width band above the main column (e.g. marketing hero) */
    hero?: ReactNode;
    children: ReactNode;
};

export default function PublicLayout({
    title,
    titleIcon: TitleIcon,
    hero,
    children,
}: PublicLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PublicHeader />
            {hero}
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 print:max-w-none print:px-8 print:py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                {title ? (
                    <h1 className="mb-6 flex items-center gap-3 text-3xl font-semibold tracking-tight sm:mb-8 sm:gap-3.5 sm:text-4xl">
                        {TitleIcon ? (
                            <HeadingIcon
                                icon={TitleIcon}
                                size="xl"
                                className="text-foreground/80"
                            />
                        ) : null}
                        {title}
                    </h1>
                ) : null}
                {children}
            </main>
            <PublicFooter />
        </div>
    );
}
