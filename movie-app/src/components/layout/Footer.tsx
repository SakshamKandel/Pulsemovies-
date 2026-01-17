import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FooterProps {
    className?: string;
}

export function Footer({ className }: FooterProps) {
    return (
        <footer className={cn("w-full bg-transparent py-6 px-6 md:px-12 mt-auto text-xs pointer-events-none", className)}>
            <div className="container mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-4 pointer-events-auto">
                {/* Copyright - Bottom Left */}
                <div className="flex flex-col items-center md:items-start gap-1">
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
                    <p className="text-text-secondary/60 mt-0.5 scale-90 origin-left">
                        © 2026 Pulsemovies. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
