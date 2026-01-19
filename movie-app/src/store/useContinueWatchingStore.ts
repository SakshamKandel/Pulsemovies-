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
    addOrUpdate: (item: Movie | TVShow, progress: number, profileId?: string, season?: number, episode?: number) => Promise<void>;
    remove: (id: number) => Promise<void>;
    getProgress: (id: number) => WatchProgress | undefined;
    clearAll: () => void;
    syncWithDatabase: (profileId: string) => Promise<void>;
}

export const useContinueWatchingStore = create<ContinueWatchingState>()(
    persist(
        (set, get) => ({
            items: [],

            addOrUpdate: async (item, progress, profileId, season, episode) => {
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
                if (profileId) {
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
                                profileId,
                            }),
                        });
                    } catch (error) {
                        console.error('Failed to sync history item', error);
                    }
                }
            },

            remove: async (id) => {
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                }));
            },

            getProgress: (id: number) => {
                return get().items.find((i) => i.id === id);
            },

            clearAll: () => {
                set({ items: [] });
            },

            syncWithDatabase: async (profileId: string) => {
                if (!profileId) return;

                try {
                    const res = await fetch(`/api/history?profileId=${profileId}`);
                    if (res.ok) {
                        const dbItems = await res.json();
                        // Retrieve full details if possible, or create partial objects
                        // ... (Existing mapping logic)

                        const incomingItems: WatchProgress[] = dbItems.map((dbItem: any) => ({
                            id: dbItem.tmdbId,
                            item: {
                                id: dbItem.tmdbId,
                                title: dbItem.title,
                                name: dbItem.title,
                                poster_path: dbItem.posterPath,
                                vote_average: 0,
                                // Add minimal required fields to satisfy Movie | TVShow type
                                overview: '',
                                release_date: '',
                                first_air_date: '',
                                genre_ids: [],
                                backdrop_path: null,
                                popularity: 0,
                                vote_count: 0,
                                adult: false,
                                original_language: 'en',
                                original_title: dbItem.title,
                                original_name: dbItem.title,
                            } as unknown as Movie | TVShow,
                            progress: dbItem.progress,
                            timestamp: new Date(dbItem.updatedAt).getTime(),
                        }));

                        set({ items: incomingItems });
                    }
                } catch (error) {
                    console.error('Failed to sync history', error);
                }
            },
        }),
        {
            name: 'continue-watching',
        }
    )
);
