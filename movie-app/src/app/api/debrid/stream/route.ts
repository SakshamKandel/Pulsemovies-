import { NextRequest, NextResponse } from 'next/server';
import { getExternalIds } from '@/lib/tmdb';

interface TorrentioStream {
    name?: string;
    title?: string;
    url?: string;
    behaviorHints?: Record<string, unknown>;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const tmdbId = searchParams.get('tmdbId');
    const type = searchParams.get('type') || 'movie';
    const season = searchParams.get('season') || '1';
    const episode = searchParams.get('episode') || '1';
    const token = searchParams.get('token') || process.env.REAL_DEBRID_API_KEY;

    if (!token) {
        return NextResponse.json(
            { error: 'No Real-Debrid API token provided' },
            { status: 400 }
        );
    }

    if (!tmdbId) {
        return NextResponse.json(
            { error: 'tmdbId parameter is required' },
            { status: 400 }
        );
    }

    try {
        // 1. Resolve TMDB ID to IMDB ID using robust tmdbApi
        const extData = await getExternalIds(parseInt(tmdbId, 10), type === 'tv' ? 'tv' : 'movie');
        const imdbId = extData.imdb_id;

        if (!imdbId) {
            return NextResponse.json(
                { error: 'No IMDB ID found for this title' },
                { status: 404 }
            );
        }

        // 2. Query Torrentio with Real-Debrid token
        const targetType = type === 'tv' ? 'series' : 'movie';
        const targetId = type === 'tv' ? `${imdbId}:${season}:${episode}` : imdbId;
        const torrentioUrl = `https://torrentio.strem.fun/realdebrid=${encodeURIComponent(token)}/stream/${targetType}/${targetId}.json`;

        const streamRes = await fetch(torrentioUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                Accept: 'application/json',
            },
            cache: 'no-store',
        });

        if (!streamRes.ok) {
            return NextResponse.json(
                { error: 'Torrentio service temporarily unavailable' },
                { status: streamRes.status }
            );
        }

        const streamData = await streamRes.json();
        const rawStreams: TorrentioStream[] = streamData.streams || [];

        // 3. Validate response
        if (rawStreams.length === 0) {
            return NextResponse.json(
                { error: 'No cached Real-Debrid streams available for this title', streams: [] },
                { status: 200 }
            );
        }

        // Check if Torrentio returned a RealDebrid error stream
        const firstStream = rawStreams[0];
        if (
            firstStream.name?.toLowerCase().includes('error') ||
            firstStream.title?.toLowerCase().includes('invalid') ||
            firstStream.title?.toLowerCase().includes('failed')
        ) {
            return NextResponse.json(
                {
                    error: firstStream.title || 'Invalid Real-Debrid API Key or un-cached content',
                    invalidToken: firstStream.title?.toLowerCase().includes('apikey') || firstStream.title?.toLowerCase().includes('token'),
                    streams: [],
                },
                { status: 401 }
            );
        }

        // 4. Parse & categorize streams
        const parsedStreams = rawStreams
            .filter((s) => s.url)
            .map((s, idx) => {
                const name = s.name || '';
                const title = s.title || '';
                const combined = `${name} ${title}`.toLowerCase();

                // Detect quality
                let quality = '720p';
                if (combined.includes('4k') || combined.includes('2160p') || combined.includes('uhd')) {
                    quality = '4K';
                } else if (combined.includes('1080p') || combined.includes('fhd')) {
                    quality = '1080p';
                }

                // Extract size info (e.g. 💾 4.5 GB)
                const sizeMatch = title.match(/💾\s*([\d.]+\s*(?:GB|MB))/i) || title.match(/([\d.]+\s*(?:GB|MB))/i);
                const size = sizeMatch ? sizeMatch[1] : '';

                // Extract clean format info
                let format = '';
                if (combined.includes('remux')) format = 'REMUX';
                else if (combined.includes('bluray') || combined.includes('bdrip')) format = 'BluRay';
                else if (combined.includes('web-dl') || combined.includes('webdl')) format = 'WEB-DL';
                else if (combined.includes('webrip')) format = 'WEBRip';
                else if (combined.includes('hdr')) format = 'HDR';

                // Display label
                const label = [
                    quality,
                    format,
                    size ? `(${size})` : ''
                ].filter(Boolean).join(' ');

                return {
                    id: `rd-${idx}`,
                    label: label || `Stream ${idx + 1} (${quality})`,
                    quality,
                    format,
                    size,
                    rawTitle: title,
                    url: s.url as string,
                };
            });

        // Sort: 4K first, then 1080p, then 720p, largest file sizes first within quality
        const qualityWeight: Record<string, number> = { '4K': 3, '1080p': 2, '720p': 1 };
        parsedStreams.sort((a, b) => {
            const weightA = qualityWeight[a.quality] || 0;
            const weightB = qualityWeight[b.quality] || 0;
            return weightB - weightA;
        });

        return NextResponse.json({
            imdbId,
            total: parsedStreams.length,
            streams: parsedStreams,
        });
    } catch (error) {
        console.error('Real-Debrid Stream Resolution Error:', error);
        return NextResponse.json(
            { error: 'Internal server error while resolving streams' },
            { status: 500 }
        );
    }
}
