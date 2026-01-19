'use client';

import { useProfile } from '@/context/ProfileContext';
import { motion } from 'framer-motion';

export function ProfileGreeting() {
    const { currentProfile } = useProfile();

    if (!currentProfile) return null;

    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const initials = currentProfile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute top-24 right-4 md:right-8 z-40 text-right"
        >
            <h2 className="text-xl md:text-2xl text-white">
                <span className="font-light text-white/60">{getGreeting()}, </span>
                <span className="font-semibold">{currentProfile.name}</span>
            </h2>
        </motion.div>
    );
}
