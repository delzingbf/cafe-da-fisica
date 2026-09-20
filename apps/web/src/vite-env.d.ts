/// <reference types="vite/client" />

interface ViteTypeOptions {
    // Makes `import.meta.env.SOMETHING_UNDECLARED` a type error.
    strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
    /** Base URL of the API. Defaults to `/api` (proxied to NestJS by the dev server). */
    readonly VITE_API_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
