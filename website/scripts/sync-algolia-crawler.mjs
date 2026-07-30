#!/usr/bin/env node
/**
 * Pushes algolia-crawler.config.mjs to the Algolia Crawler.
 *
 * The crawler cannot pull its own configuration from a repo, so CI pushes it
 * instead — see .github/workflows/algolia-crawler.yml. Credentials come from
 * CRAWLER_USER_ID and CRAWLER_API_KEY (Algolia crawler dashboard -> Settings ->
 * API keys); they are unrelated to the app's search or write keys.
 *
 * Usage:
 *   node scripts/sync-algolia-crawler.mjs [--dry-run] [--reindex]
 */
import { config, crawlerId } from '../algolia-crawler.config.mjs';

const endpoint = `https://crawler.algolia.com/api/1/crawlers/${crawlerId}`;
const dryRun = process.argv.includes('--dry-run');
// Also settable by env so CI never has to interpolate a flag into a shell.
const reindex =
  process.argv.includes('--reindex') || process.env.CRAWLER_REINDEX === 'true';

// The API takes extractors as source strings rather than as JSON objects.
const body = JSON.stringify(
  config,
  (_key, value) => (typeof value === 'function' ? value.toString() : value),
  2,
);

if (dryRun) {
  console.log(body);
  process.exit(0);
}

const userId = process.env.CRAWLER_USER_ID;
const apiKey = process.env.CRAWLER_API_KEY;

if (!(userId && apiKey)) {
  console.error(
    'Missing credentials: set CRAWLER_USER_ID and CRAWLER_API_KEY.\n' +
      'Run with --dry-run to inspect the payload without sending it.',
  );
  process.exit(1);
}

const authorization = `Basic ${Buffer.from(`${userId}:${apiKey}`).toString('base64')}`;

async function send(path, method, payload) {
  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers: { authorization, 'content-type': 'application/json' },
    body: payload,
  });
  if (!response.ok) {
    console.error(`${method} ${path} failed (${response.status}):`);
    console.error(await response.text());
    process.exit(1);
  }
  return response;
}

// PATCH is a partial update, so the write key held in the dashboard survives.
await send('/config', 'PATCH', body);
console.log(`Synced crawler configuration to ${crawlerId}.`);

// Read back and diff. A config can be accepted but stored differently from
// what was sent — most importantly, an extractor kept as a string literal
// instead of a function never runs, and the only symptom is an empty index.
const readBack = await fetch(`${endpoint}/config`, {
  headers: { authorization, accept: 'application/json' },
});

if (readBack.ok) {
  const stored = await readBack.json();
  const sent = JSON.parse(body);
  const drifted = Object.keys(sent).filter(
    (key) => JSON.stringify(stored[key]) !== JSON.stringify(sent[key]),
  );

  if (drifted.length > 0) {
    console.error(
      `Algolia stored something different from what was sent: ${drifted.join(', ')}.`,
    );
    console.error('Compare against `npm run sync:crawler -- --dry-run`.');
    process.exit(1);
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
