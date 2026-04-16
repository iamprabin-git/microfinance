export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'samuh.theme';

export function getStoredTheme(): ThemeMode | null {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw === 'light' || raw === 'dark') return raw;
        return null;
    } catch {
        return null;
    }
}

export function getPreferredTheme(): ThemeMode {
    const stored = getStoredTheme();
    if (stored) return stored;

    const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
    return prefersDark ? 'dark' : 'light';
}

export function applyTheme(mode: ThemeMode): void {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
}

export function setTheme(mode: ThemeMode): void {
    try {
        window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
        // ignore
    }

    applyTheme(mode);
    window.dispatchEvent(new CustomEvent('samuh:theme', { detail: { mode } }));
}

export function toggleTheme(): ThemeMode {
    const next: ThemeMode = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    return next;
}

export function getCurrentTheme(): ThemeMode {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function initTheme(): void {
    applyTheme(getPreferredTheme());
}

