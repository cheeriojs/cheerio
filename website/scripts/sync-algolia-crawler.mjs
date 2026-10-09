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
import { setTimeout as sleep } from 'node:timers/promises';
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

/*
 * Algolia owns these; everything else must match this repo exactly. `apiKey` is
 * the crawler's write key, deliberately absent here and preserved by the
 * partial update.
 */
const serverOwnedKeys = new Set(['apiKey']);

// Two quick attempts before giving up, so a blip does not need a human.
const retryDelaysMs = [1000, 4000];

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

/**
 * Fetch the crawler, retrying only what is plausibly transient.
 *
 * Nothing here warns and carries on: a permanent mistake — a wrong host, a key
 * that can write but not read — would otherwise look exactly like a blip and
 * leave the job green with no verification, which is how the previous endpoint
 * stayed broken for three runs.
 *
 * @param url - The crawler URL to read.
 * @param authorization - The Basic auth header value.
 * @returns The successful response.
 */
async function readWithRetries(url, authorization) {
  for (let attempt = 0; ; attempt++) {
    const retriable = attempt < retryDelaysMs.length;
    let response;

    try {
      response = await fetch(url, {
        headers: { authorization, accept: 'application/json' },
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      if (!retriable) {
        throw new Error(
          `Could not reach ${url} after ${attempt + 1} attempts.`,
          { cause: error },
        );
      }

      await sleep(retryDelaysMs[attempt]);
      continue;
    }

    if (response.ok) return response;

    // 429 and 5xx may pass; anything else is this request being wrong.
    if (!(retriable && (response.status === 429 || response.status >= 500))) {
      throw new Error(
        `Read-back failed (${response.status}) for ${url}; verification cannot run.`,
      );
    }

    await sleep(retryDelaysMs[attempt]);
  }
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
  const readBackUrl = `${endpoint}?withConfig=true`;
  const readBack = await readWithRetries(readBackUrl, authorization);

  let stored;
  try {
    const payload = await readBack.json();
    // Tolerate either envelope, but never silently diff against the wrong thing.
    const raw = payload.config ?? payload.data?.config;
    if (raw === undefined) {
      throw new Error(
        `no "config" in the response (keys: ${Object.keys(payload).join(', ')})`,
      );
    }
    stored = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (error) {
    throw new Error(
      `Could not read the configuration back from ${readBackUrl}.`,
      { cause: error },
    );
  }

  /*
   * Diff over the union of keys. Checking only what was sent would miss both a
   * stale setting left behind in the dashboard and a key deleted from this
   * file, which a partial update leaves in place — either would make the
   * "source of truth" claim in algolia-crawler.config.mjs untrue.
   */
  const sent = JSON.parse(body);
  const drifted = [...new Set([...Object.keys(sent), ...Object.keys(stored)])]
    .filter((key) => !serverOwnedKeys.has(key))
    .filter(
      (key) => stableStringify(stored[key]) !== stableStringify(sent[key]),
    )
    .toSorted(compareKeys);

  if (drifted.length > 0) {
    throw new Error(
      `Algolia stored something different from what was sent: ${drifted.join(', ')}.\n` +
        'Compare against `npm run sync:crawler -- --dry-run`.',
    );
  }
  console.log('Verified: the stored configuration matches this repo.');

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
    /*
     * Print the whole error: the `cause` carries the reason, and no error in
     * this script ever holds credentials.
     */
    console.error(error);
    process.exitCode = 1;
  }
}
