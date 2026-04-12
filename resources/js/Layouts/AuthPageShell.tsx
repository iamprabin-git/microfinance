import type { ReactNode } from 'react';

type AuthPageShellProps = {
    children: ReactNode;
    after?: ReactNode;
};

export default function AuthPageShell({ children, after }: AuthPageShellProps) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Samuh</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Company portal
                </p>
            </div>
            {children}
            {after ? (
                <div className="mt-8 w-full max-w-md">{after}</div>
            ) : null}
        </div>
    );
}
