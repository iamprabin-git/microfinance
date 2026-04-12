import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const sizeClass = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-7',
    xl: 'size-9',
} as const;

type HeadingIconProps = {
    icon: LucideIcon;
    size?: keyof typeof sizeClass;
    className?: string;
};

export function HeadingIcon({
    icon: Icon,
    size = 'md',
    className,
}: HeadingIconProps) {
    return (
        <Icon
            className={cn(
                'shrink-0 text-muted-foreground',
                sizeClass[size],
                className,
            )}
            aria-hidden
        />
    );
}
