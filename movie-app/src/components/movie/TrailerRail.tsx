'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Play } from 'lucide-react';
import { getTrendingMovies } from '@/lib/tmdb';
import { getContentTitle, getContentDate, getImageUrl } from '@/lib/utils';
import { useTrailer } from './TrailerProvider';
import type { Movie, TVShow } from '@/types/movie';

export function TrailerRail({ items, compact = false }: { items?: (Movie | TVShow)[]; compact?: boolean }) {
    const [suggestions, setSuggestions] = useState<(Movie | TVShow)[]>([]);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const root = useRef<HTMLElement>(null);
    const open = useTrailer();
    useEffect(() => {
        if (items) return;
        let active = true;
        const observer = new IntersectionObserver(entries => {
            if (!entries.some(e => e.isIntersecting)) return;
            observer.disconnect();
            getTrendingMovies().then(data => { if (active) { setSuggestions(data.results.slice(0, 6)); setFailed(!data.results.length); } }).catch(() => { if (active) setFailed(true); });
        }, { rootMargin: '200px' });
        if (root.current) observer.observe(root.current);
        return () => { active = false; observer.disconnect(); };
    }, [items, attempt]);
    const entries = (items || suggestions).slice(0, 6);
    return <section ref={root} className={compact ? 'preview-sidebar' : 'preview-section w-full px-4 md:px-8 py-8'}>
        <div className="flex items-end justify-between gap-4 mb-6"><div><h2 className="mt-2 text-2xl font-semibold tracking-tight">{compact ? 'Up next' : 'Discover your next watch'}</h2></div><Link href="/pulses" className="text-sm text-violet-300 inline-flex items-center gap-1">Pulses <ArrowUpRight size={16} /></Link></div>
        <div className={compact ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'}>
            {entries.map(item => {
                const title = getContentTitle(item);
                const type = 'title' in item ? 'movie' : 'tv';
                return <article key={`${type}:${item.id}`} className="preview-tile group relative overflow-hidden">
                    <button onClick={() => open({ id: item.id, title, type })} className="relative block w-full aspect-video overflow-hidden bg-black text-left" aria-label={`Watch ${title} trailer`}>
                        {(item.backdrop_path || item.poster_path) && <Image src={getImageUrl(item.backdrop_path || item.poster_path, 'medium', item.backdrop_path ? 'backdrop' : 'poster')} alt="" fill sizes={compact ? '350px' : '(max-width: 640px) 100vw, 33vw'} className="object-cover transition-transform duration-500 group-hover:scale-105" />}
                        <span className="absolute inset-0 preview-tile-fade" />
                        <span className="absolute top-4 right-4 flex items-center justify-center"><span className="rounded-full bg-black/50 border border-white/30 p-3 backdrop-blur-sm group-hover:bg-violet-600 transition-colors"><Play size={20} fill="currentColor" /></span></span>
                        
                        
                    </button>
                    <div className="absolute bottom-0 left-0 right-12 p-5 pointer-events-none">
                        <p className="text-[10px] uppercase tracking-[.15em] text-white/60 mb-2">{type === 'movie' ? 'Movie' : 'Series'} · {getContentDate(item)?.slice(0, 4)} · ★ {item.vote_average.toFixed(1)}</p>
                        <Link href={`/${type}/${item.id}`} className="pointer-events-auto inline-flex items-center text-lg md:text-xl font-medium leading-tight hover:text-violet-200">{title}</Link>
                    </div>
                </article>;
            })}
        </div>
        {failed && <div className="surface-panel p-6 text-sm text-zinc-400">Previews couldn’t be loaded. <button className="text-violet-300" onClick={() => { setFailed(false); setAttempt(n => n + 1); }}>Try again</button></div>}
        {!entries.length && !failed && <p className="text-sm text-zinc-500">{items ? 'No related titles available yet.' : 'Finding your next watch…'}</p>}
    </section>;
}
