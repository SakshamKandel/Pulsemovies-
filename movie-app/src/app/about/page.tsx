import React from 'react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-text-primary px-6 py-24 md:px-12 md:py-32">
            <div className="max-w-3xl mx-auto space-y-16">

                {/* Header */}
                <div className="space-y-6 text-center md:text-left border-b-2 border-white/10 pb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">About<br />Pulsemovies</h1>
                    <p className="text-xl text-text-secondary max-w-2xl leading-relaxed font-medium">
                        Redefining how you discover entertainment. Built purely for movie enthusiasts who want to explore the vast world of cinema without distractions.
                    </p>
                </div>

                {/* Mission Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white uppercase tracking-wide">Our Mission</h2>
                    <p className="text-white/80 leading-relaxed text-lg font-medium">
                        We built Pulsemovies to provide a seamless, premium, and distraction-free environment for exploring the vast world of cinema and television.
                    </p>
                </div>

                {/* Data Source / Disclaimer Section */}
                <div className="p-8 bg-transparent border-2 border-white/10 rounded-lg space-y-4 hover:border-white/30 transition-colors group">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-white/5 rounded-md group-hover:bg-accent-primary/20 transition-colors">
                            <img
                                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                                alt="TMDB Logo"
                                className="h-5 w-auto"
                            />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-wide">Data Attribution</h3>
                    </div>
                    <p className="text-text-secondary leading-relaxed font-medium">
                        This product uses the TMDB API but is not endorsed or certified by TMDB.
                        Pulsemovies is an open-source project and is not affiliated with The Movie Database.
                    </p>
                </div>

                {/* Footer Note */}
                <div className="pt-8 border-t-2 border-white/10 text-center md:text-left">
                    <p className="text-text-secondary text-sm font-bold uppercase tracking-wider">
                        © 2026 Pulsemovies. Built for the love of cinema.
                    </p>
                </div>
            </div>
        </div>
    );
}
