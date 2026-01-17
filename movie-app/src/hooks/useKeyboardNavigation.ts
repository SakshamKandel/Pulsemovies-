'use client';

import * as React from 'react';

interface KeyboardNavigationOptions {
    onEscape?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onEnter?: () => void;
    enabled?: boolean;
}

/**
 * Hook for keyboard navigation across the app.
 * Handles Escape to close modals, Arrow keys for carousels, etc.
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
    const { onEscape, onArrowLeft, onArrowRight, onArrowUp, onArrowDown, onEnter, enabled = true } = options;

    React.useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            switch (e.key) {
                case 'Escape':
                    onEscape?.();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    onArrowLeft?.();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    onArrowRight?.();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    onArrowUp?.();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    onArrowDown?.();
                    break;
                case 'Enter':
                    onEnter?.();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled, onEscape, onArrowLeft, onArrowRight, onArrowUp, onArrowDown, onEnter]);
}

/**
 * Simple hook to close on Escape key
 */
export function useEscapeKey(onEscape: () => void, enabled = true) {
    useKeyboardNavigation({ onEscape, enabled });
}
