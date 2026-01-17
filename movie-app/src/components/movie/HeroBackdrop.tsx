'use client';

import * as React from 'react';
import Image from 'next/image';

interface HeroBackdropProps {
    backdropUrl: string;
    trailerKey: string | null;
    title: string;
}

export function HeroBackdrop({ backdropUrl, trailerKey, title }: HeroBackdropProps) {
    const [videoLoaded, setVideoLoaded] = React.useState(false);
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    // Give the video some time to load before showing
    React.useEffect(() => {
        if (trailerKey) {
            // Wait for iframe to likely have loaded
            const timer = setTimeout(() => {
                setVideoLoaded(true);
            }, 2500); // 2.5 seconds buffer for video to start

            return () => clearTimeout(timer);
        }
    }, [trailerKey]);

    return (
        <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
            {/* Poster - always shown first, fades out when video loads */}
            <Image
                src={backdropUrl}
                alt={title}
                fill
                priority
                className={`object-cover transition-opacity duration-1000 ${videoLoaded && trailerKey ? 'opacity-0' : 'opacity-100'}`}
            />

            {/* Video - hidden until loaded, then fades in */}
            {trailerKey && (
                <div
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                >
                    <iframe
                        ref={iframeRef}
                        className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-[40%] pointer-events-none"
                        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&disablekb=1&fs=0&modestbranding=1&loop=1&playlist=${trailerKey}&rel=0&showinfo=0&iv_load_policy=3&playsinline=1&start=5`}
                        allow="autoplay; encrypted-media"
                        title={`${title} trailer background`}
                    />
                </div>
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </div>
    );
}
