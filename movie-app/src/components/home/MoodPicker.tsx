'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Smile, Zap, Ghost, Heart, BookOpen, CloudRain } from 'lucide-react';

const MOODS = [
    { id: 'chill', label: 'Chill', icon: Smile, color: 'bg-emerald-500', href: '/browse/movies?genre=35,16' },
    { id: 'adrenaline', label: 'Adrenaline', icon: Zap, color: 'bg-amber-500', href: '/browse/movies?genre=28,12' },
    { id: 'scared', label: 'Scared', icon: Ghost, color: 'bg-purple-500', href: '/browse/movies?genre=27,53' },
    { id: 'romantic', label: 'Romantic', icon: Heart, color: 'bg-rose-500', href: '/browse/movies?genre=10749' },
    { id: 'smart', label: 'Smart', icon: BookOpen, color: 'bg-blue-500', href: '/browse/movies?genre=99,36' },
    { id: 'sad', label: 'Feel Something', icon: CloudRain, color: 'bg-indigo-500', href: '/browse/movies?genre=18' },
];

export function MoodPicker() {
    return (
        <section className="container mx-auto px-4 md:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">How are you feeling today?</h2>
                <p className="text-text-secondary text-sm hidden md:block">Pick a mood, we'll pick the movie.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {MOODS.map((mood, index) => (
                    <Link key={mood.id} href={mood.href} className="group">
                        <motion.div
                            whileHover={{ y: -4 }}
                            className={cn(
                                "relative h-24 rounded-xl overflow-hidden cursor-pointer bg-background-card border border-border group-hover:border-transparent transition-colors",
                            )}
                        >
                            {/* Vibrant Background on Hover */}
                            <div className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                mood.color
                            )} />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 group-hover:text-white transition-colors z-10">
                                <mood.icon className={cn(
                                    "w-8 h-8 text-text-muted group-hover:text-white group-hover:scale-110 transition-all duration-300",
                                )} />
                                <span className="font-semibold text-sm">{mood.label}</span>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
