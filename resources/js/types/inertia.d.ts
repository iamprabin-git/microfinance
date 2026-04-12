import '@inertiajs/core';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            auth: {
                user: {
                    id: number;
                    name: string;
                    email: string;
                    email_verified_at: string | null;
                    role: string;
                    company: {
                        id: number;
                        name: string;
                        slug: string;
                    } | null;
                } | null;
            };
            flash?: {
                status?: string | null;
            };
        };
    }
}
