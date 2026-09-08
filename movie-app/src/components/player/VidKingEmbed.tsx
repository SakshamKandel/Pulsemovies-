'use client';

import { useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ThirdPartyPlayer } from './ThirdPartyPlayer';
import { cn } from '@/lib/utils';
import { getMediaSource } from '@/config/mediaSources';
import { useContinueWatchingStore } from '@/store/useContinueWatchingStore';
import { useProfile } from '@/context/ProfileContext';
import type { Movie, TVShow } from '@/types/movie';

interface PlayerEmbedProps {
    tmdbId: number;
    type: 'movie' | 'tv';
    season?: number;
    episode?: number;
    className?: string;
    movieTitle?: string;
    posterPath?: string | null;
    historyItem?: Movie | TVShow;
}

// Prefer configured native sources; otherwise use the selected external provider.
export function PlayerEmbed({ tmdbId, type, season = 1, episode = 1, className, movieTitle, historyItem }: PlayerEmbedProps) {
    const source = getMediaSource(tmdbId, type, season, episode);
    const videoRef = useRef<HTMLVideoElement>(null);
    const lastSave = useRef(0);
    const [failedSource, setFailedSource] = useState<string | null>(null);
    const { addOrUpdate, getProgress } = useContinueWatchingStore();
    const { currentProfile } = useProfile();
    const saveProgress = (video: HTMLVideoElement, force = false) => {
        if (!historyItem || !Number.isFinite(video.duration) || video.duration <= 0) return;
        const now = Date.now();
        if (!force && now - lastSave.current < 15000) return;
        lastSave.current = now;
        void addOrUpdate(historyItem, video.currentTime / video.duration * 100, currentProfile?.id, season, episode);
    };
    if (!source) return <div className={cn('cinema-player relative w-full bg-black', className)}><ThirdPartyPlayer key={`${type}:${tmdbId}:${season}:${episode}`} tmdbId={tmdbId} type={type} season={season} episode={episode} title={movieTitle} /></div>;
    return <div className={cn('cinema-player relative w-full bg-black', className)}>
        <div className="cinema-player-frame relative aspect-video w-full bg-black overflow-hidden">
            <>
                <video key={source.src} ref={videoRef} className="absolute inset-0 w-full h-full" controls playsInline preload="metadata" aria-label={movieTitle || 'Movie player'}
                    onError={() => setFailedSource(source.src)}
                    onTimeUpdate={e => saveProgress(e.currentTarget)}
                    onPause={e => saveProgress(e.currentTarget, true)}
                    onEnded={e => saveProgress(e.currentTarget, true)}
                    onLoadedMetadata={e => {
                        const progress = getProgress(tmdbId);
                        if (progress && progress.progress > 0 && progress.progress < 95 && (type === 'movie' || (progress.season === season && progress.episode === episode))) {
                            e.currentTarget.currentTime = e.currentTarget.duration * progress.progress / 100;
                        }
                    }}>
                    <source src={source.src} type={source.type} />
                    {source.captions?.map(track => <track key={track.language} kind="captions" src={track.src} srcLang={track.language} label={track.label} />)}
                    Your browser does not support this video format.
                </video>
                {failedSource === source.src && <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center gap-4 px-6 text-center" role="alert">
                    <p className="text-zinc-300">This video couldn’t load. Please try again shortly.</p>
                    <button onClick={() => { setFailedSource(null); videoRef.current?.load(); }} className="inline-flex items-center gap-2 text-violet-300"><RefreshCw size={16} /> Retry playback</button>
                </div>}
            </>
        </div>
    </div>;
}
