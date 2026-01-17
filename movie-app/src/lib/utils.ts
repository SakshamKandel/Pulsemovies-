import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TMDB_IMAGE_BASE_URL, IMAGE_SIZES } from './constants';

// Merge Tailwind classes without conflicts
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Build TMDB image URL
export function getImageUrl(
    path: string | null | undefined,
    size: 'small' | 'medium' | 'large' | 'original' = 'medium',
    type: 'poster' | 'backdrop' | 'profile' | 'logo' = 'poster'
): string {
    if (!path) {
        return '/images/placeholder.jpg';
    }
    const sizeKey = IMAGE_SIZES[type][size];
    return `${TMDB_IMAGE_BASE_URL}/${sizeKey}${path}`;
}

// Format date to readable string
export function formatDate(dateString: string): string {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// Format year from date string
export function formatYear(dateString: string): string {
    if (!dateString) return 'TBA';
    return new Date(dateString).getFullYear().toString();
}

// Format runtime to hours and minutes
export function formatRuntime(minutes: number): string {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

// Format vote average to one decimal place
export function formatRating(rating: number): string {
    return rating.toFixed(1);
}

// Format large numbers with K/M suffix
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Format currency
export function formatCurrency(amount: number): string {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}

// Get genre names from IDs
export function getGenreNames(
    genreIds: number[],
    genreMap: Record<number, string>
): string[] {
    return genreIds.map((id) => genreMap[id]).filter(Boolean);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Check if content is movie
export function isMovie(item: { media_type?: string; title?: string }): boolean {
    return item.media_type === 'movie' || 'title' in item;
}

// Get content title (works for both movies and TV shows)
export function getContentTitle(item: { title?: string; name?: string }): string {
    return item.title || item.name || 'Unknown';
}

// Get content release date (works for both movies and TV shows)
export function getContentDate(item: { release_date?: string; first_air_date?: string }): string {
    return item.release_date || item.first_air_date || '';
}
