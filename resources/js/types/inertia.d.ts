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
                    profile_photo_url: string | null;
                } | null;
            };
            flash?: {
                status?: string | null;
            };
            companyPortal?: {
                canManage: boolean;
                canApproveRecords: boolean;
                isEndUser: boolean;
                canInvitePortalUsers: boolean;
            };
        };
    }
}
