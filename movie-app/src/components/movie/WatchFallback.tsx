'use client';

import { useRouter } from 'next/navigation';
import { PlayerEmbed } from '@/components/player/VidKingEmbed';

export function WatchFallback({ id }: { id: number }) {
    const router = useRouter();
    return <div className="watch-cinema min-h-screen bg-black pt-16">
        <div className="watch-stage"><PlayerEmbed tmdbId={id} type="movie" /></div>
        <div className="px-5 md:px-8 py-8 text-sm text-zinc-400">
            <p>Movie details are temporarily unavailable. You can still try the player above.</p>
            <button onClick={() => router.refresh()} className="text-violet-300 mt-3">Retry movie details</button>
        </div>
    </div>;
}
