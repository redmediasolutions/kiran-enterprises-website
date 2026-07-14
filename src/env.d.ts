/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly WC_STORE_URL: string;
  readonly WC_CONSUMER_KEY: string;
  readonly WC_CONSUMER_SECRET: string;
  readonly PUBLIC_APP_URL: string;
  readonly PUBLIC_FACEBOOK_URL?: string;
  readonly PUBLIC_TWITTER_URL?: string;
  readonly PUBLIC_YOUTUBE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
