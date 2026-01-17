import React from 'react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-text-primary px-6 py-24 md:px-12 md:py-32">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Terms & Conditions</h1>
                    <p className="text-text-secondary text-lg">Last updated: January 2026</p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-white/80 leading-relaxed text-base md:text-lg">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
                        <p>
                            Welcome to Pulsemovies. By accessing or using our streaming platform, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, you may not use our service.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">2. Use of Service</h2>
                        <p>
                            Pulsemovies provides a free entertainment discovery service that allows users to browse and view movie information and related content.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                            <li>You must be at least 13 years of age to use the Pulsemovies service.</li>
                            <li>The service is for your personal and non-commercial use only.</li>
                            <li>We do not host any video content; all media is provided via third-party APIs.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">3. Data Attribution</h2>
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex-1">
                                <p>
                                    This product uses the TMDB API but is not endorsed or certified by TMDB. All movie data and images are provided by <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">The Movie Database (TMDB)</a>.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">4. User Accounts</h2>
                        <p>
                            You are responsible for maintaining the confidentiality of your account settings and for restricting access to your device.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">5. Intellectual Property</h2>
                        <p>
                            The Pulsemovies interface and design are protected by copyright. Content metadata is the property of its respective owners.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">6. Termination</h2>
                        <p>
                            We may terminate or restrict your use of our service without compensation or notice if you violate these Terms of Use.
                        </p>
                    </section>
                </div>

                <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-text-secondary text-sm">
                        © 2026 Pulsemovies. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span>Powered by</span>
                        <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB" className="h-3 opacity-70" />
                    </div>
                </div>
            </div>
        </div>
    );
}
