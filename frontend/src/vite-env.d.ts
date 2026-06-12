/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly AUTH_BACKEND_URL: string;
  readonly MUSIC_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
