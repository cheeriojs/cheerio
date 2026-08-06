/* eslint-disable @typescript-eslint/triple-slash-reference */
/* eslint-disable spaced-comment */
/* eslint-disable multiline-comment-style */
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// A CSS-only package, so it ships no type declarations of its own.
declare module '@docsearch/css';

/** Cheerio's version, injected by Vite from the root `package.json`. */
declare const __CHEERIO_VERSION__: string;
