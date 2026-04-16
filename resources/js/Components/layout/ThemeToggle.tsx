import { Button, type ButtonProps } from '@/components/ui/button';
import { getPreferredTheme, toggleTheme, type ThemeMode } from '@/lib/theme';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type ThemeToggleProps = {
    className?: string;
    variant?: ButtonProps['variant'];
    size?: ButtonProps['size'];
    label?: string;
};

export default function ThemeToggle({
    className,
    variant = 'outline',
    size = 'icon-sm',
    label,
}: ThemeToggleProps) {
    const [mode, setMode] = useState<ThemeMode>('light');

    useEffect(() => {
        setMode(getPreferredTheme());

        const onTheme = (e: Event) => {
            const ce = e as CustomEvent<{ mode: ThemeMode }>;
            if (ce.detail?.mode) setMode(ce.detail.mode);
        };

        window.addEventListener('samuh:theme', onTheme);
        return () => window.removeEventListener('samuh:theme', onTheme);
    }, []);

    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setMode(toggleTheme())}
            className={className}
        >
            {mode === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {label ? <span className="ms-2">{label}</span> : null}
        </Button>
    );
}

