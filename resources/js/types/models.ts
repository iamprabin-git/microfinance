export interface CompanyUserRow {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface GroupRow {
    id: number;
    name: string;
    description: string | null;
    monthly_contribution_amount: string;
    currency: string;
    members_count: number;
}

export interface PublicReviewRow {
    id: number;
    rating: number;
    title: string | null;
    body: string;
    author: string;
    created_at: string | null;
}

export interface PaginatedReviews {
    data: PublicReviewRow[];
    prev_page_url: string | null;
    next_page_url: string | null;
}

export interface MarketingPageContent {
    title: string;
    subtitle: string | null;
    body: string | null;
}

export interface MarketingPageProps {
    page: MarketingPageContent & { slug?: string };
}
