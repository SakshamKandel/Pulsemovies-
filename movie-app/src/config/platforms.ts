// OTT Platform theme configurations
export const PLATFORMS = {
    netflix: {
        name: 'Netflix',
        logo: '/images/netflix.png',
        gradient: 'from-red-900/40 via-red-950/20 to-transparent',
        bgColor: '#141414',
        accentColor: '#E50914',
    },
    disney: {
        name: 'Disney+',
        logo: '/images/disney.svg',
        gradient: 'from-blue-900/40 via-indigo-950/20 to-transparent',
        bgColor: '#0a1929',
        accentColor: '#0063e5',
    },
    prime: {
        name: 'Prime Video',
        logo: '/images/prime.png',
        gradient: 'from-cyan-900/40 via-slate-950/20 to-transparent',
        bgColor: '#0f171e',
        accentColor: '#00a8e1',
    },
    paramount: {
        name: 'Paramount+',
        logo: '/images/paramount.svg',
        gradient: 'from-blue-800/40 via-sky-950/20 to-transparent',
        bgColor: '#0064ff',
        accentColor: '#0064ff',
    },
} as const;

export type PlatformKey = keyof typeof PLATFORMS;
export type Platform = (typeof PLATFORMS)[PlatformKey];

