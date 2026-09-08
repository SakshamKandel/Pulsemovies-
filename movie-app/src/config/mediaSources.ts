/** Add only video files supplied by a trusted, licensed host. Never add embed-page URLs.
 * Keys: movie:TMDB_ID or tv:TMDB_ID:SEASON:EPISODE.
 * Example: 'movie:123': { src: '/media/your-movie.mp4', type: 'video/mp4' }
 * Use MP4/WebM for broad browser support; DRM/HLS providers need a separate integration.
 */
export interface MediaSource {
    src: string;
    type: 'video/mp4' | 'video/webm';
    captions?: { src: string; language: string; label: string }[];
}
export const MEDIA_SOURCES: Record<string, MediaSource> = {};
export function getMediaSource(id: number, type: 'movie' | 'tv', season = 1, episode = 1): MediaSource | undefined {
    const key = type === 'movie' ? `movie:${id}` : `tv:${id}:${season}:${episode}`;
    const source = MEDIA_SOURCES[key];
    if (!source) return undefined;
    // Direct native-video sources cannot run third-party JavaScript.
    if (!/^https:\/\//.test(source.src) && !/^\/(?!\/)/.test(source.src)) return undefined;
    return source;
}
