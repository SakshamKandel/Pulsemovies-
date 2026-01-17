import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FooterProps {
    className?: string;
}

export function Footer({ className }: FooterProps) {
    return (
        <footer className={cn("w-full bg-[#0a0a0a] border-t border-white/5 py-8 px-6 md:px-12 mt-auto text-xs", className)}>
            <div className="container mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-4 pointer-events-auto">
                {/* Logo - Bottom Left */}
                <div className="flex items-center">
                    <Link href="/">
                        <div className="relative h-12 w-32 overflow-hidden flex items-center justify-center">
                            <Image
                                src="/images/logo.png"
                                alt="Pulse Movies"
                                width={120}
                                height={40}
                                className="object-contain scale-150 opacity-80 hover:opacity-100 transition-opacity"
                            />
                        </div>
                    </Link>
                </div>

                {/* Copyright - Bottom Right */}
                <div className="flex flex-col items-center md:items-end gap-1">
                    <div className="flex items-center gap-4 opacity-80">
                        <Link href="/about" className="text-text-secondary hover:text-white transition-colors">
                            About Us
                        </Link>
                        <Link href="/terms" className="text-text-secondary hover:text-white transition-colors">
                            Terms & Conditions
                        </Link>
                        <Link href="/terms" className="text-text-secondary hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                    </div>
                    <p className="text-text-secondary/60 mt-0.5 scale-90 origin-right">
                        © 2026 Pulsemovies. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
