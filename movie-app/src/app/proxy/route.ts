import { createEmbedGuardHandler, DEFAULT_PROVIDER_HOST_RULES } from 'aetherly-embed-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const providerHosts = [
    ...DEFAULT_PROVIDER_HOST_RULES,
    { provider: 'videasy', hostRegex: /(^|\.)videasy\.to$/i },
];

const handler = createEmbedGuardHandler({
    proxyPath: '/proxy',
    providerHosts,
    requestTimeoutMs: 15000,
});

export const { GET } = handler;
