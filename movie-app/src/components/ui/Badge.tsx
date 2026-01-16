'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    size?: 'sm' | 'md';
    className?: string;
}

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    className,
}: BadgeProps) {
    const variants = {
        default: 'bg-background-card text-text-secondary border-border',
        primary: 'bg-accent-primary/20 text-accent-primary border-accent-primary/30',
        success: 'bg-green-500/20 text-green-400 border-green-500/30',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border font-medium',
                variants[variant],
                sizes[size],
                className
            )}
        >
            {children}
        </span>
    );
}

interface RatingBadgeProps {
    rating: number;
    className?: string;
}

export function RatingBadge({ rating, className }: RatingBadgeProps) {
    const getVariant = () => {
        if (rating >= 7.5) return 'success';
        if (rating >= 5) return 'warning';
        return 'danger';
    };

    return (
        <Badge variant={getVariant()} size="sm" className={className}>
            ★ {rating.toFixed(1)}
        </Badge>
    );
}
