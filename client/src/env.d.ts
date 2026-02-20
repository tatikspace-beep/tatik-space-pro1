/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FRONTEND_FORGE_API_KEY?: string;
    readonly VITE_FRONTEND_FORGE_API_URL?: string;
    readonly VITE_APP_ID?: string;
    // add other VITE_ variables here as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
