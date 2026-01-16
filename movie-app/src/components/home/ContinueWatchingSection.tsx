'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getImageUrl, getContentTitle } from '@/lib/utils';
import { useContinueWatchingStore } from '@/store/useContinueWatchingStore';

export function ContinueWatchingSection() {
    const { items, remove } = useContinueWatchingStore();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render on server or if empty
    if (!mounted || !items || items.length === 0) return null;

    return (
        <section className="container mx-auto px-4 md:px-8">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-5">
                Continue Watching
            </h2>

            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {items.slice(0, 10).map((watchItem, index) => {
                    const isMovie = 'title' in watchItem.item;
                    const title = getContentTitle(watchItem.item);
                    const posterUrl = getImageUrl(watchItem.item.backdrop_path || watchItem.item.poster_path, 'medium', 'backdrop');
                    const watchHref = isMovie
                        ? `/movie/${watchItem.id}/watch`
                        : `/tv/${watchItem.id}/watch`;

                    return (
                        <motion.div
                            key={watchItem.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative flex-shrink-0 w-[280px] md:w-[320px] group"
                        >
                            <Link href={watchHref} className="block">
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-background-card">
                                    <Image
                                        src={posterUrl}
                                        alt={title}
                                        fill
                                        className="object-cover"
                                    />

                                    {/* Play overlay */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                                            <Play className="w-6 h-6 text-black fill-black ml-1" />
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                        <div
                                            className="h-full bg-accent-primary"
                                            style={{ width: `${watchItem.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-white text-sm font-medium line-clamp-1">{title}</span>
                                    {watchItem.season && watchItem.episode && (
                                        <span className="text-text-muted text-xs">
                                            S{watchItem.season} E{watchItem.episode}
                                        </span>
                                    )}
                                </div>
                            </Link>

                            {/* Remove button */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    remove(watchItem.id);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
