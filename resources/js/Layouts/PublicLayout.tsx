import PublicFooter from '@/components/layout/PublicFooter';
import PublicHeader from '@/components/layout/PublicHeader';
import type { ReactNode } from 'react';

type PublicLayoutProps = {
    title?: string;
    children: ReactNode;
};

export default function PublicLayout({ title, children }: PublicLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PublicHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                {title ? (
                    <h1 className="mb-6 text-3xl font-semibold tracking-tight sm:mb-8 sm:text-4xl">
                        {title}
                    </h1>
                ) : null}
                {children}
            </main>
            <PublicFooter />
        </div>
    );
}
