import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

type AppLayoutProps = {
    title?: string;
    children: ReactNode;
};

export default function AppLayout({ title, children }: AppLayoutProps) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const onGroups = url.startsWith('/groups');

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-40 border-b bg-card">
                <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('dashboard')}
                            className="font-semibold tracking-tight"
                        >
                            Samuh
                        </Link>
                        <Separator orientation="vertical" className="h-6" />
                        {auth.user?.company ? (
                            <span className="text-muted-foreground text-sm">
                                {auth.user.company.name}
                            </span>
                        ) : null}
                    </div>
                    <nav className="flex items-center gap-2">
                        <Link
                            href={route('groups.index')}
                            className={cn(
                                buttonVariants({
                                    variant: onGroups ? 'secondary' : 'ghost',
                                    size: 'sm',
                                }),
                            )}
                        >
                            Groups
                        </Link>
                        <Link
                            href={route('profile.edit')}
                            className={cn(
                                buttonVariants({ variant: 'ghost', size: 'sm' }),
                            )}
                        >
                            Profile
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className={cn(
                                buttonVariants({
                                    variant: 'outline',
                                    size: 'sm',
                                }),
                            )}
                        >
                            Log out
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
                {title ? (
                    <h1 className="mb-6 text-2xl font-semibold tracking-tight">
                        {title}
                    </h1>
                ) : null}
                {children}
            </main>
        </div>
    );
}
