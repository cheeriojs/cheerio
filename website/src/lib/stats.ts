/**
 * Star and download counts for the landing page, fetched at build time.
 *
 * These are the most persuasive numbers on the site, so they must not silently
 * vanish when GitHub or npm rate-limits a CI build. Fetch failures fall back to
 * the committed values below. A slightly understated number beats no number.
 */

/*
 * Deliberately conservative, so a fallback build understates rather than
 * overstates. Monthly downloads move in both directions, so these are not a
 * floor the real figures are guaranteed to sit above. They are a safe
 * stand-in. Refresh whenever someone happens to notice.
 */
const FALLBACK_STARS = 30_000;
const FALLBACK_DOWNLOADS = 110_000_000;

export interface ProjectStats {
  stars: string;
  downloads: string;
}

/** Drops the `.0` from a whole number, so we show `30k` rather than `30.0k`. */
const trailingZeroRe = /\.0$/;

function formatCount(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(trailingZeroRe, '')}M`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1).replace(trailingZeroRe, '')}k`;
  }
  return n.toString();
}

/*
 * A stalled connection is the likeliest way these requests fail, and without a
 * deadline of our own the build would sit and wait on it. Nothing here is
 * worth holding a build for, so give up and use the fallback.
 */
const REQUEST_TIMEOUT_MS = 5000;

async function fetchCount(
  url: string,
  pick: (json: unknown) => number | undefined,
  fallback: number,
): Promise<number> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'cheerio-website',
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return fallback;
    const value = pick(await res.json());
    return typeof value === 'number' && value > 0 ? value : fallback;
  } catch {
    return fallback;
  }
}

/*
 * Started once when the module is first imported, so the components that show
 * these numbers share one pair of requests per build rather than refetching.
 */
const stats: Promise<ProjectStats> = (async () => {
  const [stars, downloads] = await Promise.all([
    fetchCount(
      'https://api.github.com/repos/cheeriojs/cheerio',
      (json) => (json as { stargazers_count?: number }).stargazers_count,
      FALLBACK_STARS,
    ),
    fetchCount(
      'https://api.npmjs.org/downloads/point/last-month/cheerio',
      (json) => (json as { downloads?: number }).downloads,
      FALLBACK_DOWNLOADS,
    ),
  ]);

  return {
    stars: formatCount(stars),
    downloads: formatCount(downloads),
  };
})();

/**
 * Read the project's headline numbers.
 *
 * @returns The formatted star and monthly download counts.
 */
export function getStats(): Promise<ProjectStats> {
  return stats;
}
