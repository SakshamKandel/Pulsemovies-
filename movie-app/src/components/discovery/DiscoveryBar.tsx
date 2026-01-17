'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, History, Gem, Dice5, ChevronDown } from 'lucide-react';
import { useDiscoveryStore } from '@/store/useDiscoveryStore';
import { cn } from '@/lib/utils';

export function DiscoveryBar() {
    const { isDeepCutsEnabled, toggleDeepCuts, selectedEra, setSelectedEra, setRouletteOpen } = useDiscoveryStore();
    const [isOpen, setIsOpen] = React.useState(false);

    const decades = [1980, 1990, 2000, 2010, 2020];

    React.useEffect(() => {
        const body = document.body;
        body.classList.remove('era-80s', 'era-90s', 'era-00s');
        if (selectedEra === 1980) body.classList.add('era-80s');
        if (selectedEra === 1990) body.classList.add('era-90s');
        if (selectedEra === 2000) body.classList.add('era-00s');
    }, [selectedEra]);

    return (
        <div className="w-full relative z-40">
            {/* Minimal Toggle */}
            <div className="container mx-auto px-4 py-3 flex justify-center">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-4 py-2 text-text-muted hover:text-accent-primary transition-colors"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-widest">
                        Discovery
                    </span>
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")} />
                </button>
            </div>

            {/* Seamless Expanded Section */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="container mx-auto px-4 pb-8">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-12">

                                {/* Deep Cuts - Inline toggle */}
                                <button
                                    onClick={toggleDeepCuts}
                                    className="flex items-center gap-3 group"
                                >
                                    <div className={cn(
                                        "w-10 h-5 rounded-full relative transition-colors",
                                        isDeepCutsEnabled ? "bg-accent-primary" : "bg-background-card"
                                    )}>
                                        <div className={cn(
                                            "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                                            isDeepCutsEnabled ? "left-5" : "left-0.5"
                                        )} />
                                    </div>
                                    <div className="text-left">
                                        <div className={cn(
                                            "text-sm font-semibold transition-colors",
                                            isDeepCutsEnabled ? "text-accent-primary" : "text-white group-hover:text-accent-primary"
                                        )}>
                                            Hidden Gems
                                        </div>
                                        <div className="text-[10px] text-text-muted uppercase tracking-wider">
                                            {isDeepCutsEnabled ? "Active" : "Off"}
                                        </div>
                                    </div>
                                </button>

                                {/* Era Filter - Seamless pill buttons */}
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-text-muted uppercase tracking-wider mr-3 hidden md:block">Era</span>
                                    <button
                                        onClick={() => setSelectedEra(null)}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-medium transition-all",
                                            selectedEra === null
                                                ? "text-accent-primary"
                                                : "text-text-muted hover:text-white"
                                        )}
                                    >
                                        All
                                    </button>
                                    {decades.map(decade => (
                                        <button
                                            key={decade}
                                            onClick={() => setSelectedEra(selectedEra === decade ? null : decade)}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-medium transition-all",
                                                selectedEra === decade
                                                    ? "text-white bg-accent-primary rounded"
                                                    : "text-text-muted hover:text-white"
                                            )}
                                        >
                                            {decade}s
                                        </button>
                                    ))}
                                </div>

                                {/* Random Pick - Simple text link */}
                                <button
                                    onClick={() => setRouletteOpen(true)}
                                    className="flex items-center gap-2 text-text-muted hover:text-accent-hover transition-colors group"
                                >
                                    <Dice5 className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                                    <span className="text-sm font-medium">Random Pick</span>
                                </button>

                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
