import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Movie, TVShow } from '@/types/movie';
import { getSession } from 'next-auth/react';

interface WatchProgress {
    id: number;
    item: Movie | TVShow;
    progress: number; // 0-100 percentage
    timestamp: number; // Last watched timestamp
    season?: number;
    episode?: number;
}

interface ContinueWatchingState {
    items: WatchProgress[];
    addOrUpdate: (item: Movie | TVShow, progress: number, season?: number, episode?: number) => Promise<void>;
    remove: (id: number) => Promise<void>;
    getProgress: (id: number) => WatchProgress | undefined;
    clearAll: () => void;
    syncWithDatabase: () => Promise<void>;
}

export const useContinueWatchingStore = create<ContinueWatchingState>()(
    persist(
        (set, get) => ({
            items: [],

            addOrUpdate: async (item, progress, season, episode) => {
                // Optimistic update
                set((state) => {
                    const existingIndex = state.items.findIndex((i) => i.id === item.id);
                    const newItem: WatchProgress = {
                        id: item.id,
                        item,
                        progress,
                        timestamp: Date.now(),
                        season,
                        episode,
                    };

                    if (existingIndex >= 0) {
                        const updated = [...state.items];
                        updated[existingIndex] = newItem;
                        return { items: updated };
                    } else {
                        return { items: [newItem, ...state.items].slice(0, 20) };
                    }
                });

                // Sync with DB
                const session = await getSession();
                if (session?.user) {
                    try {
                        const isMovie = 'title' in item;
                        await fetch('/api/history', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                tmdbId: item.id,
                                mediaType: isMovie ? 'movie' : 'tv',
                                title: isMovie ? (item as Movie).title : (item as TVShow).name,
                                posterPath: item.poster_path,
                                progress,
                            }),
                        });
                    } catch (error) {
                        console.error('Failed to sync history item', error);
                    }
                }
            },

            remove: async (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));

                const session = await getSession();
                if (session?.user) {
                    try {
                        await fetch(`/api/history?tmdbId=${id}`, {
                            method: 'DELETE',
                        });
                    } catch (error) {
                        console.error('Failed to remove history item', error);
                    }
                }
            },

            getProgress: (id) => {
                return get().items.find((item) => item.id === id);
            },

            clearAll: () => set({ items: [] }),

            syncWithDatabase: async () => {
                const session = await getSession();
                if (!session?.user) return;

                try {
                    const res = await fetch('/api/history');
                    if (res.ok) {
                        const dbItems = await res.json();
                        const validItems = dbItems.map((dbItem: any) => ({
                            id: dbItem.tmdbId,
                            item: {
                                id: dbItem.tmdbId,
                                title: dbItem.title,
                                name: dbItem.title,
                                poster_path: dbItem.posterPath,
                                vote_average: 0, // Placeholder
                                // Add other required fields depending on usage
                            } as unknown as Movie | TVShow,
                            progress: dbItem.progress,
                            timestamp: new Date(dbItem.timestamp).getTime(),
                        }));

                        // Merge strategies could be complex, for now we can just use DB as truth 
                        // or merge latest. The UI uses local store.
                        // Let's replace local with DB for now to ensure sync across devices
                        set({ items: validItems });
                    }
                } catch (error) {
                    console.error('Failed to sync history', error);
                }
            },
        }),
        {
            name: 'pulse-continue-watching',
        }
    )
);
