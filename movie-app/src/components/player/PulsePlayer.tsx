'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    RotateCcw,
    RotateCw,
    Settings,
    PictureInPicture2,
    Loader2,
    Check,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContinueWatchingStore } from '@/store/useContinueWatchingStore';
import { useProfile } from '@/context/ProfileContext';

export interface PulseStreamOption {
    id: string;
    label: string;
    quality: string;
    format?: string;
    size?: string;
    url: string;
}

interface PulsePlayerProps {
    tmdbId: number;
    title: string;
    type: 'movie' | 'tv';
    season?: number;
    episode?: number;
    posterPath?: string | null;
    streams: PulseStreamOption[];
    onSwitchToFreeEmbed?: () => void;
    className?: string;
}

export function PulsePlayer({
    tmdbId,
    title,
    type,
    season = 1,
    episode = 1,
    posterPath,
    streams,
    onSwitchToFreeEmbed,
    className,
}: PulsePlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastSaveRef = useRef<number>(0);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [selectedStreamIndex, setSelectedStreamIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    const { addOrUpdate, getProgress } = useContinueWatchingStore();
    const { currentProfile } = useProfile();

    const currentStream = streams[selectedStreamIndex] || streams[0];

    // Format seconds to mm:ss or hh:mm:ss
    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Auto-hide controls after 3 seconds of inactivity
    const handleMouseMove = () => {
        setShowControls(true);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
                setShowQualityMenu(false);
                setShowSpeedMenu(false);
            }
        }, 3000);
    };

    // Restore playback position from store on initial load
    useEffect(() => {
        const savedItem = getProgress(tmdbId);
        const matchesEpisode = type === 'movie' || (savedItem?.season === season && savedItem?.episode === episode);
        if (savedItem && matchesEpisode && savedItem.progress > 1 && savedItem.progress < 95 && videoRef.current) {
            const handleLoaded = () => {
                if (videoRef.current && videoRef.current.duration) {
                    const seekTo = (savedItem.progress / 100) * videoRef.current.duration;
                    videoRef.current.currentTime = seekTo;
                }
            };
            const vid = videoRef.current;
            vid.addEventListener('loadedmetadata', handleLoaded, { once: true });
        }
    }, [tmdbId, type, season, episode, getProgress]);

    // Save continue-watching progress
    const saveProgress = useCallback((curr: number, dur: number) => {
        if (!dur || dur <= 0 || !title) return;
        const progressPercent = (curr / dur) * 100;
        const now = Date.now();
        if (now - lastSaveRef.current > 10000 && progressPercent > 1 && progressPercent < 98) {
            addOrUpdate(
                {
                    id: tmdbId,
                    title,
                    name: title,
                    poster_path: posterPath,
                    media_type: type,
                    vote_average: 0,
                } as any,
                progressPercent,
                currentProfile?.id,
                season,
                episode
            );
            lastSaveRef.current = now;
        }
    }, [tmdbId, title, posterPath, type, season, episode, addOrUpdate, currentProfile]);

    // Play / Pause Toggle
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    // Seek helper
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    // Fast Seek (+/- 10s)
    const seekRelative = (seconds: number) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
    };

    // Volume & Mute
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            videoRef.current.muted = val === 0;
            setIsMuted(val === 0);
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        if (isMuted) {
            videoRef.current.muted = false;
            setIsMuted(false);
            if (volume === 0) setVolume(0.5);
        } else {
            videoRef.current.muted = true;
            setIsMuted(true);
        }
    };

    // Fullscreen
    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            await containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // PiP
    const togglePiP = async () => {
        if (!videoRef.current) return;
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
            await videoRef.current.requestPictureInPicture();
        }
    };

    // Playback Speed
    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
        if (videoRef.current) videoRef.current.playbackRate = speed;
        setShowSpeedMenu(false);
    };

    // Stream / Quality switch (preserve currentTime)
    const handleStreamChange = (index: number) => {
        if (index === selectedStreamIndex) return;
        const currentPos = videoRef.current?.currentTime || 0;
        const wasPlaying = !videoRef.current?.paused;
        setSelectedStreamIndex(index);
        setShowQualityMenu(false);
        setIsBuffering(true);

        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.currentTime = currentPos;
                if (wasPlaying) videoRef.current.play();
            }
        }, 100);
    };

    // Keyboard Hotkeys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'arrowleft':
                case 'j':
                    e.preventDefault();
                    seekRelative(-10);
                    break;
                case 'arrowright':
                case 'l':
                    e.preventDefault();
                    seekRelative(10);
                    break;
                case 'arrowup':
                    e.preventDefault();
                    if (videoRef.current) {
                        const newVol = Math.min(1, videoRef.current.volume + 0.1);
                        setVolume(newVol);
                        videoRef.current.volume = newVol;
                    }
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    if (videoRef.current) {
                        const newVol = Math.max(0, videoRef.current.volume - 0.1);
                        setVolume(newVol);
                        videoRef.current.volume = newVol;
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, isMuted, volume]);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className={cn(
                'relative w-full aspect-video bg-black overflow-hidden rounded-2xl select-none group border border-white/10',
                className
            )}
        >
            {/* HTML5 Native Video */}
            <video
                ref={videoRef}
                src={currentStream?.url}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onLoadedMetadata={() => {
                    if (videoRef.current) {
                        setDuration(videoRef.current.duration);
                        setIsBuffering(false);
                    }
                }}
                onTimeUpdate={() => {
                    if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime);
                        saveProgress(videoRef.current.currentTime, videoRef.current.duration);
                    }
                }}
                playsInline
                preload="metadata"
            />

            {/* Center Loading Spinner */}
            {isBuffering && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none z-20">
                    <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
                    <span className="text-zinc-400 text-xs font-medium mt-3">Buffering high-speed stream...</span>
                </div>
            )}

            {/* Center Big Play Button when paused */}
            {!isPlaying && !isBuffering && (
                <div
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer z-10"
                >
                    <div className="w-20 h-20 rounded-full bg-accent-primary flex items-center justify-center shadow-2xl shadow-accent-primary/40 hover:scale-110 active:scale-95 transition-all text-white">
                        <Play className="w-8 h-8 fill-white ml-1.5" />
                    </div>
                </div>
            )}

            {/* Top Bar (Title & Quality Badge) */}
            <div
                className={cn(
                    'absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-30 transition-opacity duration-300',
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
            >
                <div className="flex items-center gap-2 text-white">
                    <span className="font-semibold text-sm tracking-wide line-clamp-1">{title}</span>
                    {type === 'tv' && (
                        <span className="text-xs text-zinc-400 font-mono">
                            S{season} E{episode}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                        <Sparkles className="w-3 h-3" />
                        <span>Real-Debrid Direct</span>
                    </div>

                    {onSwitchToFreeEmbed && (
                        <button
                            onClick={onSwitchToFreeEmbed}
                            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 text-[11px] font-medium transition-colors"
                        >
                            Free Mirror
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Controls Bar */}
            <div
                className={cn(
                    'absolute bottom-0 inset-x-0 pt-10 pb-3 px-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 z-30 transition-opacity duration-300',
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
            >
                {/* Custom Progress Scrubber */}
                <div className="relative flex items-center group/scrubber cursor-pointer">
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent-primary group-hover/scrubber:h-2.5 transition-all"
                    />
                </div>

                {/* Main Action Buttons */}
                <div className="flex items-center justify-between text-white text-xs">
                    {/* Left Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={togglePlay}
                            className="p-1.5 hover:text-accent-primary transition-colors"
                            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                        >
                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>

                        <button
                            onClick={() => seekRelative(-10)}
                            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                            title="Rewind 10s (Left Arrow)"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => seekRelative(10)}
                            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                            title="Forward 10s (Right Arrow)"
                        >
                            <RotateCw className="w-4 h-4" />
                        </button>

                        {/* Volume / Mute */}
                        <div className="flex items-center gap-2 group/vol">
                            <button
                                onClick={toggleMute}
                                className="p-1.5 hover:text-accent-primary transition-colors"
                                title="Mute (M)"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="w-5 h-5 text-red-400" />
                                ) : (
                                    <Volume2 className="w-5 h-5" />
                                )}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-14 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                            />
                        </div>

                        {/* Time Display */}
                        <span className="text-zinc-400 font-mono text-[11px] ml-1">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-3 relative">
                        {/* Quality Selector Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowQualityMenu(!showQualityMenu);
                                    setShowSpeedMenu(false);
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[11px] font-semibold transition-colors"
                            >
                                <span>{currentStream?.quality || 'Quality'}</span>
                            </button>

                            {showQualityMenu && (
                                <div className="absolute bottom-full right-0 mb-2 w-56 bg-zinc-950/95 backdrop-blur-md border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5">
                                    <span className="text-[10px] uppercase font-bold text-zinc-400 px-2 py-1">
                                        Select Stream Quality
                                    </span>
                                    {streams.map((stream, idx) => (
                                        <button
                                            key={stream.id}
                                            onClick={() => handleStreamChange(idx)}
                                            className={cn(
                                                'flex items-center justify-between px-2.5 py-2 text-left text-xs rounded-lg transition-colors',
                                                selectedStreamIndex === idx
                                                    ? 'bg-accent-primary/20 text-accent-primary font-semibold'
                                                    : 'text-zinc-300 hover:bg-white/[0.08]'
                                            )}
                                        >
                                            <span className="truncate">{stream.label}</span>
                                            {selectedStreamIndex === idx && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Speed Menu */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowSpeedMenu(!showSpeedMenu);
                                    setShowQualityMenu(false);
                                }}
                                className="px-2 py-1 rounded-md hover:bg-white/10 text-[11px] font-mono font-medium text-zinc-300 hover:text-white transition-colors"
                                title="Playback Speed"
                            >
                                {playbackSpeed}x
                            </button>

                            {showSpeedMenu && (
                                <div className="absolute bottom-full right-0 mb-2 w-28 bg-zinc-950/95 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-2xl z-50 flex flex-col gap-0.5">
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                                        <button
                                            key={spd}
                                            onClick={() => handleSpeedChange(spd)}
                                            className={cn(
                                                'px-2.5 py-1.5 text-xs text-left rounded-lg transition-colors font-mono',
                                                playbackSpeed === spd
                                                    ? 'bg-accent-primary/20 text-accent-primary font-semibold'
                                                    : 'text-zinc-300 hover:bg-white/[0.08]'
                                            )}
                                        >
                                            {spd}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PiP */}
                        <button
                            onClick={togglePiP}
                            className="p-1.5 text-zinc-400 hover:text-white transition-colors hidden sm:inline-block"
                            title="Picture-in-Picture"
                        >
                            <PictureInPicture2 className="w-4 h-4" />
                        </button>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-1.5 hover:text-accent-primary transition-colors"
                            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                        >
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
