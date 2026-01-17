'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl, getContentTitle } from '@/lib/utils';
import { useWatchlistStore } from '@/store/useWatchlistStore';

export function MyListSection() {
    const { items: watchlist, removeFromWatchlist } = useWatchlistStore();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render on server or if empty
    if (!mounted || !watchlist || watchlist.length === 0) return null;

    return (
        <section className="container mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                    My List
                </h2>
                <Link
                    href="/my-list"
                    className="text-sm text-accent-primary hover:text-accent-primary/80 transition-colors"
                >
                    View All →
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {watchlist.slice(0, 10).map((item, index) => {
                    const isMovie = 'title' in item;
                    const title = getContentTitle(item);
                    const posterUrl = getImageUrl(item.poster_path, 'medium', 'poster');
                    const href = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;
                    const watchHref = isMovie ? `/movie/${item.id}/watch` : `/tv/${item.id}/watch`;

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative flex-shrink-0 w-[140px] md:w-[170px] group"
                        >
                            <Link href={href} className="block">
                                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-background-card">
                                    <Image
                                        src={posterUrl}
                                        alt={title}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />

                                    {/* Hover gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <p className="mt-2 text-white text-sm font-medium line-clamp-1">{title}</p>
                            </Link>

                            {/* Remove button */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    removeFromWatchlist(item.id);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
