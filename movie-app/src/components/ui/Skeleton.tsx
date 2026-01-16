'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'skeleton rounded-lg bg-background-card',
                className
            )}
        />
    );
}

export function MovieCardSkeleton() {
    return (
        <div className="flex-shrink-0 w-[180px] md:w-[200px]">
            <Skeleton className="aspect-[2/3] w-full rounded-xl" />
            <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}

export function HeroSkeleton() {
    return (
        <div className="relative h-[70vh] min-h-[500px] w-full">
            <Skeleton className="absolute inset-0" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 space-y-4">
                <Skeleton className="h-12 w-3/4 max-w-xl" />
                <Skeleton className="h-4 w-full max-w-2xl" />
                <Skeleton className="h-4 w-2/3 max-w-xl" />
                <div className="flex gap-4 mt-6">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-32" />
                </div>
            </div>
        </div>
    );
}

export function MovieRowSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                    <MovieCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export function DetailsSkeleton() {
    return (
        <div className="min-h-screen">
            <Skeleton className="h-[60vh] w-full" />
            <div className="container mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-10 w-2/3" />
                <div className="flex gap-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-24 w-full" />
                <div className="flex gap-4">
                    <Skeleton className="h-12 w-40" />
                    <Skeleton className="h-12 w-40" />
                </div>
            </div>
        </div>
    );
}
