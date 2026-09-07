'use client';

import { Play } from 'lucide-react';
import { useTrailer } from './TrailerProvider';

export function TrailerButton({ id, title, type }: { id: number; title: string; type: 'movie' | 'tv' }) {
    const open = useTrailer();
    return <button onClick={() => open({ id, title, type })} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-violet-500/15 transition-colors font-medium"><Play size={18} /> Watch trailer</button>;
}
