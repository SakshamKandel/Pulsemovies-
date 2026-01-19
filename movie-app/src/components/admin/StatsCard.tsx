'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    description?: string;
    className?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    description,
    className
}: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'bg-background-card border border-border rounded-2xl p-6',
                'hover:border-accent-primary/30 transition-colors duration-300',
                className
            )}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-accent-primary" />
                </div>
                {trend && (
                    <span className={cn(
                        'text-sm font-medium px-2 py-1 rounded-full',
                        trend.isPositive
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                    )}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>

            <p className="text-text-muted text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>

            {description && (
                <p className="text-text-muted text-xs mt-2">{description}</p>
            )}
        </motion.div>
    );
}
