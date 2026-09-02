declare module '@vercel/node' {
    import type * as http from 'http';

    export type VercelRequest = http.IncomingMessage & {
        query?: Record<string, any>;
        cookies?: Record<string, string>;
        body?: any;
    };

    export type VercelResponse = http.ServerResponse & {
        json?: (body: any) => void;
        status?: (code: number) => VercelResponse;
        cookie?: (name: string, value: string, options?: Record<string, any>) => void;
        clearCookie?: (name: string, options?: Record<string, any>) => void;
    };

    function handler(req: VercelRequest, res: VercelResponse): void | Promise<void>;
    export default handler;
}
