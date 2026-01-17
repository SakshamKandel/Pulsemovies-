'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, Play, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useContinueWatchingStore } from '@/store/useContinueWatchingStore';
import { getImageUrl, formatYear, getContentTitle, getContentDate } from '@/lib/utils';

export default function HistoryPage() {
    const { items, remove, clearAll } = useContinueWatchingStore();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen pt-24 pb-16">
                <div className="container mx-auto px-4 md:px-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Watch History</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-32 bg-background-card animate-pulse rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Sort by most recently watched
    const sortedItems = [...items].sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <History className="w-8 h-8 text-accent-primary" />
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Watch History</h1>
                    </div>
                    {sortedItems.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>

                {sortedItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <Clock className="w-16 h-16 text-text-muted mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No watch history</h2>
                        <p className="text-text-secondary max-w-md">
                            Start watching movies and TV shows to see your history here.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedItems.map((watchItem, index) => {
                            const item = watchItem.item;
                            const isMovie = 'title' in item;
                            const title = getContentTitle(item);
                            const year = formatYear(getContentDate(item));
                            const posterUrl = getImageUrl(item.poster_path, 'small', 'poster');
                            const href = isMovie ? `/movie/${item.id}/watch` : `/tv/${item.id}/watch`;
                            const watchedDate = new Date(watchItem.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            });

                            return (
                                <motion.div
                                    key={watchItem.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative group bg-background-card rounded-xl overflow-hidden border border-border hover:border-accent-primary/50 transition-colors"
                                >
                                    <Link href={href} className="flex gap-4 p-4">
                                        {/* Poster */}
                                        <div className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0">
                                            {item.poster_path ? (
                                                <Image
                                                    src={posterUrl}
                                                    alt={title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-background flex items-center justify-center text-text-muted text-xs">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium line-clamp-1 group-hover:text-accent-primary transition-colors">
                                                {title}
                                            </h3>
                                            <p className="text-text-muted text-sm">{year}</p>

                                            {/* Progress bar */}
                                            <div className="mt-3">
                                                <div className="h-1 bg-background rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-accent-primary rounded-full"
                                                        style={{ width: `${watchItem.progress}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-xs text-text-muted">{watchItem.progress}% watched</span>
                                                    <span className="text-xs text-text-muted">{watchedDate}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Play icon on hover */}
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play className="w-8 h-8 text-accent-primary fill-current" />
                                        </div>
                                    </Link>

                                    {/* Remove button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            remove(watchItem.id);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        title="Remove from history"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
