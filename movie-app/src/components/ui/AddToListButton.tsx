'use client';

import * as React from 'react';
import { Plus, Check } from 'lucide-react';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import { cn } from '@/lib/utils';
import type { Movie, TVShow, MovieDetails, TVShowDetails } from '@/types/movie';

interface AddToListButtonProps {
    item: Movie | TVShow | MovieDetails | TVShowDetails;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

import { useProfile } from '@/context/ProfileContext';

// ...

export function AddToListButton({ item, className, size = 'lg' }: AddToListButtonProps) {
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
    const { currentProfile } = useProfile();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const inWatchlist = mounted && isInWatchlist(item.id);

    const handleClick = () => {
        if (inWatchlist) {
            removeFromWatchlist(item.id, currentProfile?.id);
        } else {
            addToWatchlist(item, currentProfile?.id);
        }
    };

    const sizeClasses = {
        sm: 'px-3 py-2 text-sm gap-1.5',
        md: 'px-4 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                'flex items-center font-medium rounded-lg transition-all',
                sizeClasses[size],
                inWatchlist
                    ? 'bg-accent-primary text-white'
                    : 'bg-background-card border border-border text-text-secondary hover:text-white hover:border-accent-primary',
                className
            )}
        >
            {inWatchlist ? (
                <>
                    <Check className={iconSizes[size]} />
                    <span>In My List</span>
                </>
            ) : (
                <>
                    <Plus className={iconSizes[size]} />
                    <span>Add to List</span>
                </>
            )}
        </button>
    );
}
