import { create } from 'zustand';

interface DiscoveryState {
    isDeepCutsEnabled: boolean;
    selectedEra: number | null; // e.g., 1980, 1990
    isRouletteOpen: boolean;

    toggleDeepCuts: () => void;
    setSelectedEra: (era: number | null) => void;
    setRouletteOpen: (isOpen: boolean) => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set) => ({
    isDeepCutsEnabled: false,
    selectedEra: null,
    isRouletteOpen: false,

    toggleDeepCuts: () => set((state) => ({ isDeepCutsEnabled: !state.isDeepCutsEnabled })),
    setSelectedEra: (era) => set({ selectedEra: era }),
    setRouletteOpen: (isOpen) => set({ isRouletteOpen: isOpen }),
}));
