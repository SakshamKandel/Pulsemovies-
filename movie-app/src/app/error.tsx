'use client';

import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <div className="min-h-[75vh] flex items-center justify-center px-6 pt-24 pb-12">
        <div className="surface-panel max-w-lg w-full p-8 text-center">
            <p className="eyebrow">LET’S TRY THAT AGAIN</p>
            <h1 className="text-2xl mt-3">This page couldn’t load</h1>
            <p className="text-zinc-400 text-sm leading-relaxed mt-4">The movie service may be temporarily unavailable. Try again in a moment.</p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <button onClick={reset} className="inline-flex items-center gap-2 px-5 py-3 bg-violet-600 rounded-xl"><RefreshCw size={16} /> Try again</button>
                <Link href="/my-list" className="px-5 py-3 rounded-xl border border-white/10">Go to My List</Link>
            </div>
        </div>
    </div>;
}
