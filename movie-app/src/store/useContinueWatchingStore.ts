import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Movie, TVShow } from '@/types/movie';

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
    addOrUpdate: (item: Movie | TVShow, progress: number, season?: number, episode?: number) => void;
    remove: (id: number) => void;
    getProgress: (id: number) => WatchProgress | undefined;
    clearAll: () => void;
}

export const useContinueWatchingStore = create<ContinueWatchingState>()(
    persist(
        (set, get) => ({
            items: [],

            addOrUpdate: (item, progress, season, episode) => {
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
                        // Update existing
                        const updated = [...state.items];
                        updated[existingIndex] = newItem;
                        return { items: updated };
                    } else {
                        // Add new (limit to 20 items)
                        return { items: [newItem, ...state.items].slice(0, 20) };
                    }
                });
            },

            remove: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            getProgress: (id) => {
                return get().items.find((item) => item.id === id);
            },

            clearAll: () => set({ items: [] }),
        }),
        {
            name: 'pulse-continue-watching',
        }
    )
);
