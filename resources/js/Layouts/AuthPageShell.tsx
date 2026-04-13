import PublicFooter from '@/components/layout/PublicFooter';
import PublicHeader from '@/components/layout/PublicHeader';
import { Building2 } from 'lucide-react';
import type { ReactNode } from 'react';

type AuthPageShellProps = {
    children: ReactNode;
    after?: ReactNode;
};

export default function AuthPageShell({ children, after }: AuthPageShellProps) {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-muted/40 to-background">
            <PublicHeader />
            <main className="flex flex-1 flex-col items-center px-4 py-8 print:max-w-none print:px-8 sm:py-12">
                <p className="text-muted-foreground mb-6 flex items-center justify-center gap-2 text-center text-sm font-medium">
                    <Building2
                        className="text-muted-foreground size-4 shrink-0"
                        aria-hidden
                    />
                    Company portal
                </p>
                {children}
                {after ? (
                    <div className="mt-8 w-full max-w-md">{after}</div>
                ) : null}
            </main>
            <PublicFooter variant="compact" />
        </div>
    );
}
