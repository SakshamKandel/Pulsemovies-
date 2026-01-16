import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Movie, TVShow } from '@/types/movie';

type WatchlistItem = (Movie | TVShow) & { addedAt: number };

interface WatchlistState {
    items: WatchlistItem[];
    addToWatchlist: (item: Movie | TVShow) => void;
    removeFromWatchlist: (id: number) => void;
    isInWatchlist: (id: number) => boolean;
    clearWatchlist: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
    persist(
        (set, get) => ({
            items: [],

            addToWatchlist: (item) => {
                const exists = get().items.some((i) => i.id === item.id);
                if (!exists) {
                    set((state) => ({
                        items: [...state.items, { ...item, addedAt: Date.now() }],
                    }));
                }
            },

            removeFromWatchlist: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            isInWatchlist: (id) => {
                return get().items.some((item) => item.id === id);
            },

            clearWatchlist: () => {
                set({ items: [] });
            },
        }),
        {
            name: 'watchlist-storage',
        }
    )
);
