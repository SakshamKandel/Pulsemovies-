'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn, getImageUrl } from '@/lib/utils';
import Image from 'next/image';

const MOODS = [
    {
        id: 'chill',
        label: 'Chill',
        imagePath: '/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg', // Kung Fu Panda 4
        href: '/browse/movies?genre=35,16'
    },
    {
        id: 'adrenaline',
        label: 'Adrenaline',
        imagePath: '/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg', // Mad Max Fury Road
        href: '/browse/movies?genre=28,12'
    },
    {
        id: 'scared',
        label: 'Scared',
        imagePath: '/nRj5511mZdTl4saWEPoj9QroTIu.jpg', // The Shining
        href: '/browse/movies?genre=27,53'
    },
    {
        id: 'romantic',
        label: 'Romantic',
        imagePath: '/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg', // Titanic
        href: '/browse/movies?genre=10749'
    },
    {
        id: 'smart',
        label: 'Smart',
        imagePath: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', // Oppenheimer
        href: '/browse/movies?genre=99,36'
    },
    {
        id: 'sad',
        label: 'Feel Something',
        imagePath: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg', // Shawshank Redemption
        href: '/browse/movies?genre=18'
    },
];

export function MoodPicker() {
    const [failedImages, setFailedImages] = React.useState<Set<string>>(new Set());

    const handleImageError = (id: string) => {
        setFailedImages(prev => new Set(prev).add(id));
    };

    return (
        <section className="container mx-auto px-4 md:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">How are you feeling today?</h2>
                <p className="text-text-secondary text-sm hidden md:block">Pick a mood, we'll pick the movie.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {MOODS.map((mood) => {
                    const hasFailed = failedImages.has(mood.id);

                    return (
                        <Link key={mood.id} href={mood.href} className="group relative h-32 rounded-xl overflow-hidden block">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-full h-full relative"
                            >
                                {/* Background Image */}
                                {!hasFailed ? (
                                    <Image
                                        src={getImageUrl(mood.imagePath, 'medium', 'poster')}
                                        alt={mood.label}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={() => handleImageError(mood.id)}
                                    />
                                ) : (
                                    // Fallback gradient if image fails
                                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                                )}

                                {/* Gradient Overlay - Fade to seamless edge */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />

                                {/* Text Content */}
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                    <span className="font-bold text-white text-lg tracking-wide drop-shadow-md group-hover:scale-105 transition-transform z-10">
                                        {mood.label}
                                    </span>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
