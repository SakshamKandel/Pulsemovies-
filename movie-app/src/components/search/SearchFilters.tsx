'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOVIE_GENRES } from '@/lib/constants';

const YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2010, 2005, 2000];
const RATINGS = [9, 8, 7, 6, 5];

export function SearchFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = React.useState(false);

    const query = searchParams.get('q') || '';
    const genre = searchParams.get('genre') || '';
    const year = searchParams.get('year') || '';
    const rating = searchParams.get('rating') || '';

    const hasFilters = genre || year || rating;

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set('page', '1'); // Reset to page 1 on filter change
        router.push(`/search?${params.toString()}`);
    };

    const clearFilters = () => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="mb-6">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
                    hasFilters ? "text-accent-primary" : "text-text-muted hover:text-white"
                )}
            >
                <Filter className="w-4 h-4" />
                Filters
                {hasFilters && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-accent-primary text-white rounded">
                        {[genre, year, rating].filter(Boolean).length}
                    </span>
                )}
            </button>

            {/* Filter Panel */}
            {isOpen && (
                <div className="mt-4 p-4 bg-background-secondary border border-border space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-white">Filters</span>
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-text-muted hover:text-white flex items-center gap-1"
                            >
                                <X className="w-3 h-3" /> Clear all
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Genre Filter */}
                        <div>
                            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                                Genre
                            </label>
                            <select
                                value={genre}
                                onChange={(e) => updateFilter('genre', e.target.value)}
                                className="w-full p-2 bg-background-card border border-border text-white text-sm focus:border-accent-primary outline-none"
                            >
                                <option value="">All Genres</option>
                                {Object.entries(MOVIE_GENRES).map(([id, name]) => (
                                    <option key={id} value={id}>{name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Year Filter */}
                        <div>
                            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                                Year
                            </label>
                            <select
                                value={year}
                                onChange={(e) => updateFilter('year', e.target.value)}
                                className="w-full p-2 bg-background-card border border-border text-white text-sm focus:border-accent-primary outline-none"
                            >
                                <option value="">Any Year</option>
                                {YEARS.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
                                Min Rating
                            </label>
                            <select
                                value={rating}
                                onChange={(e) => updateFilter('rating', e.target.value)}
                                className="w-full p-2 bg-background-card border border-border text-white text-sm focus:border-accent-primary outline-none"
                            >
                                <option value="">Any Rating</option>
                                {RATINGS.map((r) => (
                                    <option key={r} value={r}>{r}+ stars</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
