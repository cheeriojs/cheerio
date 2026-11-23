// oxlint-disable-next-line typescript/triple-slash-reference -- A reference loads Astro's generated types into this ambient script.
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// A CSS-only package, so it ships no type declarations of its own.
declare module '@docsearch/css';

/** Cheerio's version, injected by Vite from the root `package.json`. */
declare const __CHEERIO_VERSION__: string;
