'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MovieCard } from '@/components/movie/MovieCard';
import type { Movie, TVShow } from '@/types/movie';
import type { Platform, PlatformKey } from '@/config/platforms';

interface PlatformCarouselProps {
    platform: Platform;
    platformKey: PlatformKey;
    items: (Movie | TVShow)[];
    className?: string;
}

export function PlatformCarousel({ platform, platformKey, items, className }: PlatformCarouselProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(true);
    const [isDragging, setIsDragging] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [scrollLeft, setScrollLeft] = React.useState(0);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
        }
    };

    React.useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', checkScroll);
        }
        return () => {
            if (el) el.removeEventListener('scroll', checkScroll);
        };
    }, [items]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * 0.8;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        scrollRef.current.scrollLeft = scrollLeft - (e.pageX - scrollRef.current.offsetLeft - startX) * 2;
    };

    if (!items || items.length === 0 || !platform) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4 }}
            className={cn('relative group rounded-xl overflow-hidden', className)}
            style={{
                background: `linear-gradient(135deg, ${platform.accentColor}08 0%, transparent 60%)`,
            }}
        >


            <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <Image
                        src={platform.logo}
                        alt={platform.name}
                        width={90}
                        height={28}
                        className={cn(
                            'h-6 w-auto object-contain',
                            platform.name === 'Paramount+' && 'brightness-0 invert'
                        )}
                    />

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className={cn(
                                'p-1.5 rounded-full transition-colors',
                                !canScrollLeft ? 'opacity-30' : 'hover:bg-white/10'
                            )}
                            style={{ color: platform.accentColor }}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className={cn(
                                'p-1.5 rounded-full transition-colors',
                                !canScrollRight ? 'opacity-30' : 'hover:bg-white/10'
                            )}
                            style={{ color: platform.accentColor }}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        <Link
                            href={`/platform/${platformKey}`}
                            className="ml-1 text-xs font-medium px-3 py-1 rounded-full transition-all hover:scale-105"
                            style={{
                                color: platform.accentColor,
                                background: `${platform.accentColor}15`,
                            }}
                        >
                            See More
                        </Link>
                    </div>
                </div>

                {/* Carousel with fade */}
                <div className="relative">
                    {/* Left fade */}
                    <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none transition-opacity",
                        canScrollLeft ? "opacity-100" : "opacity-0"
                    )} style={{ background: `linear-gradient(to right, ${platform.bgColor || '#0D0D0D'}, transparent)` }} />

                    {/* Right fade */}
                    <div className={cn(
                        "absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none transition-opacity",
                        canScrollRight ? "opacity-100" : "opacity-0"
                    )} style={{ background: `linear-gradient(to left, ${platform.bgColor || '#0D0D0D'}, transparent)` }} />

                    <div
                        ref={scrollRef}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className={cn(
                            'flex gap-3 overflow-x-auto hide-scrollbar',
                            isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
                        )}
                        style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
                    >
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                className="flex-shrink-0"
                                style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                            >
                                <MovieCard item={item} index={index} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
