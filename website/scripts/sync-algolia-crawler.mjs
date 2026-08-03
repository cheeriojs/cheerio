/**
 * Pushes algolia-crawler.config.mjs to the Algolia Crawler.
 *
 * The crawler cannot pull its own configuration from a repo, so CI pushes it
 * instead — see the `sync-crawler` job in .github/workflows/site.yml.
 * Credentials come from CRAWLER_USER_ID and CRAWLER_API_KEY (Algolia crawler
 * dashboard -> Account settings); they are unrelated to the app's search or
 * write keys.
 *
 * Usage:
 *   node scripts/sync-algolia-crawler.mjs [--dry-run] [--reindex]
 */
import { config, crawlerId } from '../algolia-crawler.config.mjs';

const endpoint = `https://crawler.algolia.com/api/1/crawlers/${crawlerId}`;
const dryRun = process.argv.includes('--dry-run');
/*
 * Also settable by env so CI never has to interpolate a flag into a shell
 * command.
 */
const reindex =
  process.argv.includes('--reindex') || process.env.CRAWLER_REINDEX === 'true';

// Fail fast rather than letting an unresponsive endpoint hang the CI job.
const timeoutMs = 30_000;

/*
 * The API rejects a bare source string with "recordExtractor must be a valid
 * object", so functions travel in the envelope the platform stores them in.
 */
const body = JSON.stringify(
  config,
  (_key, value) =>
    typeof value === 'function'
      ? { __type: 'function', source: value.toString() }
      : value,
  2,
);

/**
 * Unwrap function envelopes so a config compares equal whether the API echoes
 * an extractor back wrapped or as a bare source string.
 *
 * @param value - The value to normalise.
 * @returns The value with every function envelope replaced by its source.
 */
function unwrapFunctions(value) {
  if (Array.isArray(value)) return value.map((item) => unwrapFunctions(item));
  if (value && typeof value === 'object') {
    if (value.__type === 'function' && typeof value.source === 'string') {
      return value.source;
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, unwrapFunctions(item)]),
    );
  }
  return value;
}

/**
 * Order keys by code unit rather than locale, so the canonical form does not
 * shift with the machine's locale.
 *
 * @param a - The first key.
 * @param b - The second key.
 * @returns A negative number if `a` sorts first.
 */
function compareKeys(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/**
 * Serialise with object keys sorted, so a response that merely orders its keys
 * differently from this file does not read as drift.
 *
 * @param value - The value to serialise.
 * @returns A key-order-independent JSON string.
 */
function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .toSorted(compareKeys)
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

async function sync() {
  const userId = process.env.CRAWLER_USER_ID;
  const apiKey = process.env.CRAWLER_API_KEY;

  if (!(userId && apiKey)) {
    throw new Error(
      'Missing credentials: set CRAWLER_USER_ID and CRAWLER_API_KEY.\n' +
        'Run with --dry-run to inspect the payload without sending it.',
    );
  }

  /*
   * `Uint8Array#toBase64()` is not in Node 24, which is what `lts/*` resolves
   * to on the runner — it threw "toBase64 is not a function" there. Buffer
   * works on every version this repo runs on.
   */
  // eslint-disable-next-line unicorn/prefer-uint8array-base64
  const authorization = `Basic ${Buffer.from(`${userId}:${apiKey}`).toString('base64')}`;

  async function send(path, method, payload) {
    const response = await fetch(`${endpoint}${path}`, {
      method,
      headers: { authorization, 'content-type': 'application/json' },
      body: payload,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      throw new Error(
        `${method} ${path} failed (${response.status}): ${await response.text()}`,
      );
    }
    return response;
  }

  // PATCH is a partial update, so the write key held in the dashboard survives.
  await send('/config', 'PATCH', body);
  console.log(`Synced crawler configuration to ${crawlerId}.`);

  /*
   * Read back and diff. A config can be accepted but stored differently from
   * what was sent — most importantly, an extractor kept as a string literal
   * instead of a function never runs, and the only symptom is an empty index.
   */
  // There is no GET on /config; the configuration comes back with the crawler.
  const readBack = await fetch(`${endpoint}?withConfig=true`, {
    headers: { authorization, accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  });

  /*
   * A 404 means this URL is wrong rather than the service being unwell, and a
   * verification step that quietly does nothing is worse than none — that is
   * exactly how the previous endpoint went unnoticed.
   */
  if (readBack.status === 404) {
    throw new Error(
      `Read-back returned 404 for ${endpoint}?withConfig=true — the endpoint is wrong.`,
    );
  }

  if (readBack.ok) {
    const payload = await readBack.json();
    // The crawler may arrive wrapped, and its config as a JSON string.
    const crawler = payload.data ?? payload;
    const stored =
      typeof crawler.config === 'string'
        ? JSON.parse(crawler.config)
        : (crawler.config ?? crawler);
    const sent = JSON.parse(body);
    const drifted = Object.keys(sent).filter(
      (key) =>
        stableStringify(unwrapFunctions(stored[key])) !==
        stableStringify(unwrapFunctions(sent[key])),
    );

    if (drifted.length > 0) {
      throw new Error(
        `Algolia stored something different from what was sent: ${drifted.join(', ')}.\n` +
          'Compare against `npm run sync:crawler -- --dry-run`.',
      );
    }
    console.log('Verified: the stored configuration matches this repo.');
  } else {
    console.warn(
      `Could not read the config back (${readBack.status}); skipping verification.`,
    );
  }

  if (reindex) {
    await send('/reindex', 'POST');
    console.log('Triggered a reindex.');
  }
}

if (dryRun) {
  console.log(body);
} else {
  try {
    await sync();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
