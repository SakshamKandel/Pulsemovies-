export const PLAYER_PROVIDERS = [
    { id: 'vidking', label: 'VidKing', origin: 'https://www.vidking.net', available: true },
    { id: 'vidlink', label: 'JW Player', origin: 'https://vidlink.pro', available: true },
] as const;

export type PlayerProvider = typeof PLAYER_PROVIDERS[number]['id'];

export function getPlayerUrl(provider: PlayerProvider = 'vidking', id: number, type: 'movie' | 'tv', season = 1, episode = 1): string {
    if (!Number.isSafeInteger(id) || id <= 0 || (type === 'tv' && (!Number.isSafeInteger(season) || season < 1 || !Number.isSafeInteger(episode) || episode < 1))) {
        throw new Error('Invalid title or episode');
    }
    const host = PLAYER_PROVIDERS.find(item => item.id === provider) ?? PLAYER_PROVIDERS[0];
    if (provider === 'vidking') {
        const path = type === 'movie' ? `movie/${id}` : `tv/${id}/${season}/${episode}`;
        const url = new URL(`/embed/${path}`, host.origin);
        url.searchParams.set('color', '8b5cf6');
        url.searchParams.set('autoPlay', 'false');
        if (type === 'tv') {
            url.searchParams.set('nextEpisode', 'true');
            url.searchParams.set('episodeSelector', 'true');
        }
        return url.toString();
    }

    const path = `${type}/${id}${type === 'tv' ? `/${season}/${episode}` : ''}`;
    const url = new URL(`/${path}`, host.origin);
    url.searchParams.set('primaryColor', '8b5cf6');
    url.searchParams.set('autoplay', 'false');
    return url.toString();
}

/**
 * Players that check window.frameElement.sandbox and refuse to play / black-screen.
 * These must be loaded directly without any sandbox attribute.
 */
export const SENSITIVE_PLAYERS = [
    'vidking.net',
    'vidfast.pro',
    'vidlink.pro',
    'embed.su',
    'vidsrc.to',
    '2embed.cc',
] as const;

export function isSensitivePlayer(urlOrOrigin: string): boolean {
    if (!urlOrOrigin) return false;
    const lower = urlOrOrigin.toLowerCase();
    return SENSITIVE_PLAYERS.some(domain => lower.includes(domain.toLowerCase()));
}
