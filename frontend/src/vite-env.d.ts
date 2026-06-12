/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_BACKEND_URL: string;
  readonly VITE_MUSIC_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
