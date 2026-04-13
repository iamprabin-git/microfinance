import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Printer } from 'lucide-react';

type PrintPageButtonProps = Omit<ButtonProps, 'onClick' | 'type'> & {
    /** Screen-reader label (visible label defaults to "Print"). */
    label?: string;
    /** When false, only the printer icon is shown (for tight toolbars). */
    showLabel?: boolean;
};

export default function PrintPageButton({
    className,
    variant = 'outline',
    size = 'sm',
    label = 'Print',
    showLabel = true,
    children,
    ...props
}: PrintPageButtonProps) {
    const visible = children ?? (showLabel ? label : null);

    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            className={cn('gap-2', className)}
            aria-label={label}
            {...props}
            onClick={() => window.print()}
        >
            <Printer className="size-4 shrink-0 opacity-80" aria-hidden />
            {visible}
        </Button>
    );
}
