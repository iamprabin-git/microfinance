import NepaliDate from 'nepali-date-converter';

/**
 * Convert an AD calendar date string (YYYY-MM-DD) to Bikram Sambat for display.
 * Uses local midnight components so the calendar day matches the picker value.
 */
export function formatBsFromAdYmd(ymd: string): string {
    const parts = ymd.split('-').map((p) => parseInt(p, 10));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
        return '';
    }
    const [y, m, d] = parts;
    try {
        const ad = new Date(y, m - 1, d);
        const nd = NepaliDate.fromAD(ad);

        return nd.format('DD MMMM YYYY', 'np');
    } catch {
        return '';
    }
}

export function formatBsIsoFromAdYmd(ymd: string): string {
    const parts = ymd.split('-').map((p) => parseInt(p, 10));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
        return '';
    }
    const [y, m, d] = parts;
    try {
        const ad = new Date(y, m - 1, d);
        const nd = NepaliDate.fromAD(ad);

        return nd.format('YYYY-MM-DD', 'en');
    } catch {
        return '';
    }
}
