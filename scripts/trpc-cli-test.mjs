import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

const client = createTRPCProxyClient({
    links: [
        httpBatchLink({
            url: (() => {
                const envUrl = process.env.TRPC_URL || 'http://localhost:3003/api/trpc';
                return envUrl.toLowerCase().includes('/api/trpc') ? envUrl : envUrl.replace(/\/$/, '') + '/api/trpc';
            })(),
            transformer: superjson,
            fetch
        }),
    ],
});

(async () => {
    try {
        console.log('Calling auth.register');
        const reg = await client.auth.register.mutate({ email: 'ci+user@example.com', password: 'password123', name: 'CI User' });
        console.log('register result', reg);
    } catch (err) {
        console.error('register error', err?.message || err);
        try {
            console.error('meta:', JSON.stringify(err?.meta?.responseJSON || err?.cause?.responseJSON || err, null, 2));
        } catch (e) {
            console.error('meta (raw):', err?.meta?.responseJSON || err?.cause?.responseJSON || err);
        }
    }

    try {
        console.log('Calling auth.login');
        const login = await client.auth.login.mutate({ email: 'ci+user@example.com', password: 'password123' });
        console.log('login result', login);
    } catch (err) {
        console.error('login error', err?.message || err);
        try {
            console.error('meta:', JSON.stringify(err?.meta?.responseJSON || err?.cause?.responseJSON || err, null, 2));
        } catch (e) {
            console.error('meta (raw):', err?.meta?.responseJSON || err?.cause?.responseJSON || err);
        }
    }
})();
