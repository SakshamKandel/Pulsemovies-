'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const variants = {
            primary:
                'bg-gradient-magenta text-white hover:opacity-90 shadow-glow hover:shadow-glow-lg',
            secondary:
                'bg-background-card text-text-primary border border-border hover:border-accent-primary hover:text-accent-primary',
            ghost:
                'bg-transparent text-text-primary hover:bg-background-card hover:text-accent-primary',
            outline:
                'bg-transparent border-2 border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-white',
            danger:
                'bg-red-600 text-white hover:bg-red-700',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg',
            icon: 'p-2',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300',
                    'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    leftIcon
                )}
                {children}
                {rightIcon && !isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
