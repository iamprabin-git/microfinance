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
    slug?: string;
    meta_description?: string | null;
    hero_image_url?: string | null;
}

export interface MarketingPageProps {
    page: MarketingPageContent;
}

export interface GroupOption {
    id: number;
    name: string;
    currency: string;
}

export interface MemberListRow {
    id: number;
    member_number: number | null;
    savings_account_number?: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    profile_photo_url: string | null;
}

export interface CompanyMemberOption {
    id: number;
    name: string;
    member_number?: number | null;
    savings_account_number?: string | null;
}

export interface MemberMissingSavingsRow {
    id: number;
    name: string;
    member_number: number | null;
    savings_account_number?: string | null;
}

export interface SavingListRow {
    id: number;
    period: string;
    amount: string;
    status: string;
    company_approval_status: string;
    paid_at: string | null;
    currency: string;
    member: {
        id: number;
        name: string;
        member_number?: number | null;
        savings_account_number?: string | null;
    };
}

export interface LoanListRow {
    id: number;
    loan_account_number?: string | null;
    principal: string;
    issued_at: string;
    due_date: string | null;
    status: string;
    company_approval_status: string;
    repaid: string;
    currency: string;
    member: { id: number; name: string };
}

export interface ChartOfAccountRow {
    id: number;
    type: string;
    code: string;
    name: string;
    description: string | null;
    is_active: boolean;
    assigned_users_count: number;
}

export interface ProductRow {
    id: number;
    type: string;
    code: string;
    name: string;
    description: string | null;
    is_active: boolean;
}
