'use client';

import { createContext, useContext, useRef, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2, X } from 'lucide-react';
import { getMovieDetails, getTVDetails } from '@/lib/tmdb';
import type { Video } from '@/types/movie';

type TrailerTarget = { id: number; title: string; type: 'movie' | 'tv' };
const TrailerContext = createContext<(target: TrailerTarget) => void>(() => {});
export const useTrailer = () => useContext(TrailerContext);

export function TrailerProvider({ children }: { children: React.ReactNode }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const request = useRef(0);
    const trigger = useRef<HTMLElement | null>(null);
    const cache = useRef(new Map<string, Video | null>());
    const [target, setTarget] = useState<TrailerTarget | null>(null);
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const close = () => {
        request.current++;
        dialog.current?.close();
        setVideo(null);
        setTarget(null);
        trigger.current?.focus();
    };
    const open = async (next: TrailerTarget) => {
        const version = ++request.current;
        trigger.current = document.activeElement as HTMLElement;
        setTarget(next);
        setVideo(null);
        setFailed(false);
        setLoading(true);
        dialog.current?.showModal();
        try {
            const key = `${next.type}:${next.id}`;
            let trailer = cache.current.get(key);
            if (trailer === undefined) {
                const details = await (next.type === 'movie' ? getMovieDetails(next.id) : getTVDetails(next.id));
                const videos = (details.videos?.results || []).filter(v => v.site === 'YouTube' && /^[\w-]{11}$/.test(v.key));
                trailer = videos.find(v => v.type === 'Trailer' && v.official) || videos.find(v => v.type === 'Trailer') || videos.find(v => v.type === 'Teaser') || null;
                cache.current.set(key, trailer);
            }
            if (version === request.current) setVideo(trailer);
        } catch {
            if (version === request.current) setFailed(true);
        } finally {
            if (version === request.current) setLoading(false);
        }
    };
    return <TrailerContext.Provider value={open}>
        {children}
        <dialog ref={dialog} className="trailer-dialog" onCancel={e => { e.preventDefault(); close(); }} onClick={e => { if (e.target === e.currentTarget) close(); }} aria-labelledby="trailer-heading">
            <div className="trailer-cinema">
                <div className="trailer-picture">
                    {loading ? <Loader2 className="animate-spin text-violet-400" aria-label="Loading trailer" /> : video ? <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${video.key}?autoplay=1&rel=0&playsinline=1`} title={video.name} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <div className="text-center p-8" role="status"><p>{failed ? 'Could not load this preview.' : 'No trailer is available for this title yet.'}</p><button onClick={() => target && open(target)} className="text-violet-300 mt-3">Try again</button></div>}
                </div>
                <div className="trailer-caption">
                    <div className="min-w-0"><p className="text-xs text-white/50 mb-2">Trailer</p><h2 id="trailer-heading" className="text-xl md:text-3xl font-medium leading-tight">{target?.title}</h2></div>
                    <button onClick={close} aria-label="Close trailer" className="trailer-close"><X size={24} /></button>
                </div>
                <div className="trailer-links">
                    {video && <a className="inline-flex items-center gap-2 text-white/60 hover:text-white" href={`https://www.youtube.com/watch?v=${video.key}`} target="_blank" rel="noreferrer">YouTube <ExternalLink size={14} /></a>}
                    {target && <Link onClick={close} href={`/${target.type}/${target.id}`} className="text-white inline-flex items-center">Explore this title →</Link>}
                </div>
            </div>
        </dialog>
    </TrailerContext.Provider>;
}
