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

export interface GroupOption {
    id: number;
    name: string;
    currency: string;
}

export interface MemberListRow {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    group: { id: number; name: string; currency: string };
}

export interface SavingListRow {
    id: number;
    period: string;
    amount: string;
    status: string;
    paid_at: string | null;
    group: { id: number; name: string; currency: string };
    member: { id: number; name: string };
}

export interface LoanListRow {
    id: number;
    principal: string;
    issued_at: string;
    due_date: string | null;
    status: string;
    repaid: string;
    group: { id: number; name: string; currency: string };
    member: { id: number; name: string };
}

export type MembersByGroup = Record<string, { id: number; name: string }[]>;
