/**
 * @file Script To fetch sponsor data from Open Collective and GitHub.
 *
 *   Adapted from
 *   https://github.com/eslint/website/blob/230e73457dcdc2353ad7934e876a5a222a17b1d7/_tools/fetch-sponsors.js.
 */

import * as fs from 'node:fs/promises';

import ImgixClient from '@imgix/js-core';
import { graphql as githubGraphQL } from '@octokit/graphql';
import { request } from 'undici';

type Tier = 'headliner' | 'sponsor' | 'professional' | 'backer';

interface Sponsor {
  createdAt: string | null;
  name: string | null;
  image: string | null;
  url: string | null;
  type: string;
  monthlyDonation: number;
  totalDonations: number;
  source: 'github' | 'opencollective' | 'manual';
  tier: Tier | null;
}

interface OpenCollectiveAmount {
  value: number | null;
}

interface OpenCollectiveCharge {
  kind: string | null;
  type: string;
  isRefund: boolean | null;
  isRefunded: boolean | null;
  createdAt: string | null;
  amount: OpenCollectiveAmount;
}

interface OpenCollectiveOrder {
  createdAt: string | null;
  lastChargedAt: string | null;
  fromAccount: {
    slug: string;
    name: string | null;
    website: string | null;
    imageUrl: string | null;
    type: string;
  } | null;
  amount: OpenCollectiveAmount;
  frequency: string | null;
  totalDonations: OpenCollectiveAmount;
  transactions?: (OpenCollectiveCharge | null)[] | null;
}

interface OpenCollectiveOrders {
  totalCount: number | null;
  nodes: (OpenCollectiveOrder | null)[] | null;
}

interface OpenCollectiveResponse {
  data?: {
    account: {
      active: OpenCollectiveOrders;
      cancelled: OpenCollectiveOrders;
    } | null;
  } | null;
}

interface GitHubSponsorship {
  createdAt: string;
  sponsor: {
    name: string | null;
    avatarUrl: string;
    url: string;
    websiteUrl: string | null;
    isViewer?: boolean;
  } | null;
  tier: { monthlyPriceInDollars: number } | null;
}

interface GitHubSponsorsResponse {
  organization: {
    sponsorshipsAsMaintainer: {
      nodes: (GitHubSponsorship | null)[] | null;
    };
  } | null;
}

const tierSponsors: Record<Tier, Sponsor[]> = {
  headliner: [
    // Some sponsors are manually added here.
    {
      createdAt: '2022-06-24',
      name: 'Github',
      image: 'https://avatars.githubusercontent.com/github',
      url: 'https://github.com/',
      type: 'ORGANIZATION',
      monthlyDonation: 0,
      totalDonations: 0,
      source: 'manual',
      tier: 'headliner',
    },
    {
      createdAt: '2018-05-02',
      name: 'AirBnB',
      image: 'https://avatars.githubusercontent.com/airbnb',
      url: 'https://www.airbnb.com/',
      type: 'ORGANIZATION',
      monthlyDonation: 0,
      totalDonations: 0,
      source: 'manual',
      tier: 'headliner',
    },
  ],
  sponsor: [],
  professional: [],
  backer: [],
};

const { CHEERIO_SPONSORS_GITHUB_TOKEN, IMGIX_TOKEN } = process.env;

if (!CHEERIO_SPONSORS_GITHUB_TOKEN) {
  throw new Error('Missing CHEERIO_SPONSORS_GITHUB_TOKEN.');
}

// Node exposes the CommonJS constructor as the ESM default.
const ImgixConstructor = ImgixClient as unknown as typeof ImgixClient.default;
const imgix = new ImgixConstructor({
  domain: 'humble.imgix.net',
  secureURLToken: IMGIX_TOKEN,
});

/**
 * Returns the tier ID for a given donation amount.
 *
 * @param monthlyDonation - The monthly donation in dollars.
 * @returns The ID of the tier the donation belongs to.
 */
function getTierSlug(monthlyDonation: number): Tier | null {
  if (monthlyDonation >= 250) {
    return 'headliner';
  }

  if (monthlyDonation >= 100) {
    return 'sponsor';
  }

  if (monthlyDonation >= 25) {
    return 'professional';
  }

  if (monthlyDonation >= 5) {
    return 'backer';
  }

  return null;
}

/**
 * Returns when a recurring charge stops covering its sponsor, clamping the day
 * to the end of shorter months (e.g. Jan 31 + 1 month is Feb 28, not Mar 3).
 *
 * @param chargedAt - When the order was last charged.
 * @param months - The length of the billing period in months.
 * @returns The end of the paid period, in milliseconds since the epoch.
 */
function getPaidUntil(chargedAt: string, months: number): number {
  const date = new Date(chargedAt);
  const day = date.getUTCDate();

  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);

  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();

  date.setUTCDate(Math.min(day, lastDay));

  return date.getTime();
}

/**
 * Returns an order's latest charge, unless it was refunded. Rejected
 * contributions are refunded and cancelled, and must not keep their listing.
 *
 * @param order - The order, including its transactions.
 * @returns The latest charge that still stands, if any.
 */
function getLastKeptCharge(
  order: OpenCollectiveOrder,
): OpenCollectiveCharge | undefined {
  const transactions = order.transactions ?? [];
  let lastCharge: OpenCollectiveCharge | undefined;

  for (const transaction of transactions) {
    if (transaction === null) {
      throw new TypeError('Open Collective order has a missing transaction.');
    }

    if (
      transaction.kind === 'CONTRIBUTION' &&
      transaction.type === 'CREDIT' &&
      !transaction.isRefund &&
      (!lastCharge ||
        (transaction.createdAt !== null &&
          lastCharge.createdAt !== null &&
          transaction.createdAt > lastCharge.createdAt))
    ) {
      lastCharge = transaction;
    }
  }

  return lastCharge?.isRefunded ? undefined : lastCharge;
}

/**
 * Returns the monthly amount, in dollars, of an Open Collective order.
 *
 * @param order - The order.
 * @returns The monthly amount.
 */
function getMonthlyAmount(order: OpenCollectiveOrder): number | null {
  return order.frequency === 'YEARLY'
    ? Number(order.amount.value) / 12
    : order.amount.value;
}

/**
 * Fetch order data from Open Collective using the GraphQL API.
 *
 * @returns An array of sponsors.
 */
async function fetchOpenCollectiveSponsors(): Promise<Sponsor[]> {
  const endpoint = 'https://api.opencollective.com/graphql/v2';

  const query = `{
        account(slug: "cheerio") {
          active: orders(status: [ACTIVE], filter: INCOMING, limit: 1000) {
            totalCount
            nodes {
              ...SponsorOrder
            }
          }
          cancelled: orders(status: [CANCELLED], filter: INCOMING, limit: 1000) {
            totalCount
            nodes {
              ...SponsorOrder
              transactions {
                kind
                type
                isRefund
                isRefunded
                amount {
                  value
                }
                createdAt
              }
            }
          }
        }
      }

      fragment SponsorOrder on Order {
        createdAt
        lastChargedAt
        fromAccount {
          slug
          name
          website
          imageUrl
          type
        }
        amount {
          value
        }
        tier {
          slug
        }
        frequency
        totalDonations {
          value
        }
      }`;

  const { body } = await request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const payload = (await body.json()) as OpenCollectiveResponse;

  const account = payload.data?.account;
  if (!account) {
    throw new TypeError('Open Collective response is missing the account.');
  }
  const { active, cancelled } = account;
  const activeOrders = active.nodes;
  const cancelledOrders = cancelled.nodes;
  if (!activeOrders || !cancelledOrders) {
    throw new TypeError('Open Collective response is missing its order lists.');
  }

  // Fail loudly instead of silently dropping sponsors once a page is not enough.
  if (
    activeOrders.length < Number(active.totalCount) ||
    cancelledOrders.length < Number(cancelled.totalCount)
  ) {
    throw new Error('Open Collective orders exceed one page; add pagination.');
  }

  if (
    !activeOrders.every((order) => order !== null) ||
    !cancelledOrders.every((order) => order !== null)
  ) {
    throw new TypeError('Open Collective response has a missing order.');
  }

  // The highest monthly amount each account currently pays via active orders.
  const activeAmounts = new Map<string | undefined, number>();

  for (const order of activeOrders) {
    const slug = order.fromAccount?.slug;
    const amount = Math.max(
      activeAmounts.get(slug) ?? 0,
      Number(getMonthlyAmount(order)),
    );
    activeAmounts.set(slug, amount);
  }

  /*
   * A cancelled recurring order has still paid for its current period, so keep
   * the sponsor listed until that period is over. Per account, the highest paid
   * order wins — including over a smaller active order the sponsor switched to.
   */
  const stillPaid = new Map<
    string,
    { order: OpenCollectiveOrder; paidUntil: number }
  >();

  for (const order of cancelledOrders) {
    if (!order.fromAccount) {
      continue;
    }

    const { slug } = order.fromAccount;
    const months =
      order.frequency === 'MONTHLY' ? 1 : order.frequency === 'YEARLY' ? 12 : 0;

    if (!order.lastChargedAt || months === 0) {
      continue;
    }

    const paidUntil = getPaidUntil(order.lastChargedAt, months);

    const charge = paidUntil > Date.now() && getLastKeptCharge(order);

    if (!charge) {
      continue;
    }

    // Recognize the amount that was actually charged, not a later edit.
    order.amount = charge.amount;

    const amount = getMonthlyAmount(order);
    const current = stillPaid.get(slug);
    const currentAmount = current ? getMonthlyAmount(current.order) : -1;

    if (
      Number(amount) <= (activeAmounts.get(slug) ?? -1) ||
      Number(amount) < Number(currentAmount) ||
      (amount === currentAmount && paidUntil <= current!.paidUntil)
    ) {
      continue;
    }

    stillPaid.set(slug, { order, paidUntil });
  }

  const orders = activeOrders.filter(
    ({ fromAccount }) => !fromAccount || !stillPaid.has(fromAccount.slug),
  );

  for (const { order } of stillPaid.values()) {
    orders.push(order);
  }

  return orders.map((order): Sponsor => {
    const { fromAccount } = order;
    const donation = Number(order.amount.value) * 100;
    const monthlyDonation =
      order.frequency === 'YEARLY' ? Math.round(donation / 12) : donation;

    if (!fromAccount) {
      throw new TypeError(
        'Open Collective active order is missing its account.',
      );
    }

    return {
      createdAt: order.createdAt,
      name: fromAccount.name,
      url: fromAccount.website,
      image: fromAccount.imageUrl,
      type: fromAccount.type,
      monthlyDonation,
      totalDonations: Number(order.totalDonations.value) * 100,
      source: 'opencollective',
      tier: getTierSlug(
        Math.min(monthlyDonation / 100, Number(order.totalDonations.value)),
      ),
    };
  });
}

function getMonthsActive(date: string): number {
  const now = new Date();
  const then = new Date(date);
  const months = (now.getFullYear() - then.getFullYear()) * 12;
  return months - then.getMonth() + now.getMonth() + 1;
}

/**
 * Fetches GitHub Sponsors data using the GraphQL API.
 *
 * @returns An array of sponsors.
 */
async function fetchGitHubSponsors(): Promise<Sponsor[]> {
  const { organization } = await githubGraphQL<GitHubSponsorsResponse>(
    `{
      organization(login: "cheeriojs") {
        sponsorshipsAsMaintainer(first: 100) {
          nodes {
            sponsor: sponsorEntity {
              ... on User {
                name
                login
                avatarUrl
                url
                websiteUrl
                isViewer
              }
              ... on Organization {
                name
                login
                avatarUrl
                url
                websiteUrl
                viewerCanAdminister
              }
            }
            tier {
              monthlyPriceInDollars
            }
            createdAt
          }
        }
      }
    }
    `,
    {
      headers: {
        authorization: `token ${CHEERIO_SPONSORS_GITHUB_TOKEN}`,
      },
    },
  );

  const sponsorships = organization?.sponsorshipsAsMaintainer.nodes;
  if (!sponsorships) {
    throw new TypeError('GitHub response is missing its sponsorship list.');
  }

  return sponsorships.map((sponsorship): Sponsor => {
    if (!sponsorship?.sponsor) {
      throw new TypeError('GitHub sponsorship is missing its sponsor.');
    }

    const { sponsor, tier, createdAt } = sponsorship;
    return {
      createdAt,
      name: sponsor.name,
      image: `${sponsor.avatarUrl}&s=128`,
      // oxlint-disable-next-line typescript/prefer-nullish-coalescing -- An empty website URL should also fall back to the profile URL.
      url: sponsor.websiteUrl || sponsor.url,
      type:
        // Workaround to get the type — fetch a field that only exists on users.
        sponsor.isViewer === undefined ? 'ORGANIZATION' : 'INDIVIDUAL',
      monthlyDonation: (tier?.monthlyPriceInDollars ?? 0) * 100,
      totalDonations:
        getMonthsActive(createdAt) * Number(tier?.monthlyPriceInDollars) * 100,
      source: 'github',
      tier: getTierSlug(tier?.monthlyPriceInDollars ?? 0),
    };
  });
}

async function fetchSponsors(): Promise<Sponsor[]> {
  const results = await Promise.all([
    fetchOpenCollectiveSponsors(),
    fetchGitHubSponsors(),
  ]);

  return results.flat();
}

/*
 * Remove sponsors from lower tiers that have individual accounts,
 * but are clearly orgs.
 */
const MISLABELED_ORGS =
  /[ck]as[iy]+no|bet$|poker|gambling|coffee|tuxedo|(?:ph|f)oto/i;

const README_PATH = new URL('../Readme.md', import.meta.url);
const JSON_PATH = new URL('../website/sponsors.json', import.meta.url);

const SECTION_START_BEGINNING = '<!-- BEGIN SPONSORS:';
const SECTION_START_END = '-->';
const SECTION_END = '<!-- END SPONSORS -->';

/*
 * Sponsors whose profile is missing a link or logo, or points somewhere other
 * than what they asked to have listed.
 */
/*
 * Extra imgix parameters, for logos that need cropping before they fit the
 * square slot the README gives them.
 */
const imgixOverrides = new Map([
  // Crop the wordmark down to just the mark on its left.
  ['Rapidproxy', { rect: '0,0,92,92' }],
]);

const sponsorOverrides = new Map<string, Partial<Sponsor>>([
  ['Vasy Kafidoff', { url: 'https://kafidoff.com' }],
  [
    'ScrapingBee',
    {
      url: 'https://www.scrapingbee.com/?utm_source=sponsorships&utm_medium=backlinks&utm_campaign=cheerio_js_org',
    },
  ],
  [
    'Rapidproxy',
    {
      url: 'https://www.rapidproxy.io/?ref=cheerio',
      image:
        'https://www.rapidproxy.io/static/rapidproxy/images/hd_ft_public/rapidproxy_logo.webp',
    },
  ],
]);

const sponsors = await fetchSponsors();

console.log('Received sponsors:', sponsors);

// Remove sponsors that are already in the pre-populated headliners
for (let i = 0; i < sponsors.length; i++) {
  if (
    tierSponsors.headliner.every((sponsor) => sponsor.url !== sponsors[i].url)
  ) {
    continue;
  }

  sponsors.splice(i, 1);
  i--;
}

sponsors.sort(
  (a, b) => Date.parse(String(a.createdAt)) - Date.parse(String(b.createdAt)),
);

// Process into a useful format
for (const sponsor of sponsors) {
  if (
    !sponsor.tier || // Always skip if sponsor has no tier (e.g., donation < $5)
    // OR if it's a 'professional' or 'backer' tier AND meets specific filtering criteria
    ((sponsor.tier === 'professional' || sponsor.tier === 'backer') &&
      (sponsor.type === 'ORGANIZATION' ||
        MISLABELED_ORGS.test(String(sponsor.name)) ||
        MISLABELED_ORGS.test(String(sponsor.url))))
  ) {
    continue;
  }

  if (sponsor.name !== null) {
    Object.assign(sponsor, sponsorOverrides.get(sponsor.name));
  }

  tierSponsors[sponsor.tier].push(sponsor);
}

for (const tier of Object.values(tierSponsors)) {
  // Sort order based on total donations
  tier.sort((a: Sponsor, b: Sponsor) => b.totalDonations - a.totalDonations);

  // Set all donations to 0 before writing to JSON
  for (const sponsor of tier) {
    sponsor.monthlyDonation = 0;
    sponsor.totalDonations = 0;
  }
}

// Write sponsors.json
await fs.writeFile(JSON_PATH, JSON.stringify(tierSponsors, null, 2), 'utf8');

// Prepend professionals to backers for now
tierSponsors.backer.unshift(...tierSponsors.professional);

let readme = await fs.readFile(README_PATH, 'utf8');

const TIER_IMAGE_SIZES: Record<Tier, number> = {
  headliner: 128,
  sponsor: 64,
  professional: 64,
  backer: 48,
};

for (let sectionStartIndex = 0; ;) {
  sectionStartIndex = readme.indexOf(
    SECTION_START_BEGINNING,
    sectionStartIndex,
  );

  if (sectionStartIndex < 0) break;

  sectionStartIndex += SECTION_START_BEGINNING.length;

  const sectionStartEndIndex = readme.indexOf(
    SECTION_START_END,
    sectionStartIndex,
  );
  const sectionName = readme
    .slice(sectionStartIndex, sectionStartEndIndex)
    .trim() as Tier;

  const sectionContentStart = sectionStartEndIndex + SECTION_START_END.length;

  const sectionEndIndex = readme.indexOf(SECTION_END, sectionContentStart);

  readme = `${readme.slice(0, sectionContentStart)}\n\n${tierSponsors[
    sectionName
  ]
    .map((s: Sponsor) => {
      const size = TIER_IMAGE_SIZES[s.tier ?? sectionName];
      if (s.image === null) {
        throw new TypeError('Cannot render a README sponsor without an image.');
      }
      const overrides =
        s.name === null ? undefined : imgixOverrides.get(s.name);
      // Display each sponsor's image in the README.
      return `<a href="${String(s.url)}" target="_blank" rel="noopener noreferrer">
            <img height="${size}px" width="${size}px" src="${imgix.buildURL(
              s.image,
              {
                w: size,
                h: size,
                fit: 'fillmax',
                fill: 'solid',
                ...overrides,
              },
            )}" title="${String(s.name)}" alt="${String(s.name)}"></img>
          </a>`;
    })
    .join('\n')}\n\n${readme.slice(sectionEndIndex)}`;
}

await fs.writeFile(README_PATH, readme, {
  encoding: 'utf8',
});
