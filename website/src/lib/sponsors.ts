export interface Sponsor {
  name: string;
  image: string;
  /** Sponsors that never set a website on their profile have no URL. */
  url: string | null;
}

/**
 * Marks sponsor links as paid, per Google's guidance on link schemes.
 * GitHub already applies `nofollow` to README links; the website has to say so
 * itself.
 */
export const SPONSOR_REL = 'sponsored noopener noreferrer';

/**
 * Sponsor URLs come from Open Collective and GitHub profiles, so they are
 * third-party data rather than something we control. Only turn a sponsor into
 * a link when the URL is one we know is safe to render.
 *
 * @param url - The sponsor's profile URL, if they set one.
 * @returns The URL to link to, or `undefined` to render no link at all.
 */
export function sponsorHref(url: string | null): string | undefined {
  if (!url) return;

  try {
    const { protocol } = new URL(url);
    return protocol === 'https:' || protocol === 'http:' ? url : undefined;
  } catch {
    // Not a parsable URL, so there is nothing safe to link to.
    return;
  }
}
