'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Trash2, ListX } from 'lucide-react';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import { MovieCard } from '@/components/movie/MovieCard';

export default function MyListPage() {
    const { items: watchlist, removeFromWatchlist, clearWatchlist } = useWatchlistStore();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen pt-24 pb-16">
                <div className="container mx-auto px-4 md:px-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">My List</h1>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-background-card animate-pulse rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">My List</h1>
                    {watchlist.length > 0 && (
                        <button
                            onClick={clearWatchlist}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>

                {watchlist.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <ListX className="w-16 h-16 text-text-muted mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Your list is empty</h2>
                        <p className="text-text-secondary max-w-md">
                            Start adding movies and TV shows to your list by clicking the &quot;Add to List&quot; button on any title.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {watchlist.map((item, index) => (
                            <div key={item.id} className="relative group/remove">
                                <MovieCard item={item} index={index} />
                                <button
                                    onClick={() => removeFromWatchlist(item.id)}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-black/70 text-white opacity-0 group-hover/remove:opacity-100 transition-opacity hover:bg-red-600 z-30"
                                    title="Remove from list"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
