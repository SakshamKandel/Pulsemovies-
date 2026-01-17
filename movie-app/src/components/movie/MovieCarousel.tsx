'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import type { Movie, TVShow } from '@/types/movie';

interface MovieCarouselProps {
    title: string;
    items: (Movie | TVShow)[];
    isLoading?: boolean;
    showRank?: boolean;
    className?: string;
    seeMoreLink?: string;
}

export function MovieCarousel({
    title,
    items,
    isLoading = false,
    showRank = false,
    className,
    seeMoreLink,
}: MovieCarouselProps) {
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
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (el) {
                el.removeEventListener('scroll', checkScroll);
            }
            window.removeEventListener('resize', checkScroll);
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

    // Drag handlers for draggable carousel
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    if (isLoading) {
        return (
            <div className={cn('space-y-4', className)}>
                <div className="h-8 w-48 bg-background-card rounded animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <MovieCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4 }}
            className={cn('relative group/carousel', className)}
        >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                    {title}
                </h2>

                <div className="flex items-center gap-3">
                    {/* Navigation Arrows - Hidden on Mobile */}
                    <button
                        onClick={() => scroll('left')}
                        className={cn(
                            'hidden md:block p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors',
                            !canScrollLeft && 'opacity-30 pointer-events-none'
                        )}
                    >
                        <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className={cn(
                            'hidden md:block p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors',
                            !canScrollRight && 'opacity-30 pointer-events-none'
                        )}
                    >
                        <ChevronRight className="w-4 h-4 text-white" />
                    </button>

                    {/* See More Link */}
                    {seeMoreLink && (
                        <Link
                            href={seeMoreLink}
                            className="ml-1 text-sm font-medium text-accent-primary hover:text-accent-primary/80 transition-colors"
                        >
                            See More →
                        </Link>
                    )}
                </div>
            </div>

            {/* Carousel with fade edges */}
            <div className="relative">
                {/* Left fade */}
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity",
                    canScrollLeft ? "opacity-100" : "opacity-0"
                )} />

                {/* Right fade */}
                <div className={cn(
                    "absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity",
                    canScrollRight ? "opacity-100" : "opacity-0"
                )} />

                {/* Draggable Carousel */}
                <div
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className={cn(
                        'flex gap-4 overflow-x-auto hide-scrollbar py-4 px-1',
                        showRank && 'pl-6',
                        isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
                    )}
                    style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
                >
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                        >
                            <MovieCard
                                item={item}
                                index={index}
                                showRank={showRank}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
