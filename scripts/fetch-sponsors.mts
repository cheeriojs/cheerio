/**
 * @file Script To fetch sponsor data from Open Collective and GitHub.
 *
 *   Adapted from
 *   https://github.com/eslint/website/blob/230e73457dcdc2353ad7934e876a5a222a17b1d7/_tools/fetch-sponsors.js.
 */

import * as fs from 'node:fs/promises';
import { request } from 'undici';
import { graphql as githubGraphQL } from '@octokit/graphql';
import ImgixClient from '@imgix/js-core';

type Tier = 'headliner' | 'sponsor' | 'professional' | 'backer';

interface Sponsor {
  createdAt: string;
  name: string;
  image: string;
  url: string;
  type: 'ORGANIZATION' | 'INDIVIDUAL' | 'FUND';
  monthlyDonation: number;
  source: 'github' | 'opencollective' | 'manual';
  tier: Tier | null;
}

const tierSponsors: Record<Tier, Sponsor[]> = {
  headliner: [
    // Some sponsors are manually added here.
    {
      createdAt: '2023-03-03',
      name: 'Tidelift',
      image: 'https://github.com/tidelift.png',
      url: 'https://tidelift.com/subscription/pkg/npm-cheerio',
      type: 'FUND',
      monthlyDonation: 0,
      source: 'manual',
      tier: 'headliner',
    },
    {
      createdAt: '2022-06-24',
      name: 'Github',
      image: 'https://github.com/github.png',
      url: 'https://github.com/',
      type: 'ORGANIZATION',
      monthlyDonation: 0,
      source: 'manual',
      tier: 'headliner',
    },
    {
      createdAt: '2018-05-02',
      name: 'AirBnB',
      image: 'https://github.com/airbnb.png',
      url: 'https://www.airbnb.com/',
      type: 'ORGANIZATION',
      monthlyDonation: 0,
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

const imgix = new ImgixClient({
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
 * Fetch order data from Open Collective using the GraphQL API.
 *
 * @returns An array of sponsors.
 */
async function fetchOpenCollectiveSponsors(): Promise<Sponsor[]> {
  const endpoint = 'https://api.opencollective.com/graphql/v2';

  const query = `{
        account(slug: "cheerio") {
          orders(status: ACTIVE, filter: INCOMING) {
            nodes {
              createdAt
              fromAccount {
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
            }
          }
        }
      }`;

  const { body } = await request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const payload = await body.json();

  return payload.data.account.orders.nodes.map((order: any) => {
    const donation = order.amount.value * 100;
    const monthlyDonation =
      order.frequency === 'YEARLY' ? Math.round(donation / 12) : donation;

    return {
      createdAt: order.createdAt,
      name: order.fromAccount.name,
      url: order.fromAccount.website,
      image: order.fromAccount.imageUrl,
      type: order.fromAccount.type,
      monthlyDonation,
      totalDonations: order.totalDonations.value * 100,
      source: 'opencollective',
      tier: getTierSlug(monthlyDonation / 100),
    };
  });
}

/**
 * Fetches GitHub Sponsors data using the GraphQL API.
 *
 * @returns An array of sponsors.
 */
async function fetchGitHubSponsors(): Promise<Sponsor[]> {
  const { organization } = await githubGraphQL<any>(
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
    }
  );

  // Return an array in the same format as Open Collective
  return organization.sponsorshipsAsMaintainer.nodes.map(
    ({ sponsor, tier, createdAt }: any) => ({
      createdAt,
      name: sponsor.name,
      image: `${sponsor.avatarUrl}&s=128`,
      url: sponsor.websiteUrl || sponsor.url,
      type:
        // Workaround to get the type — fetch a field that only exists on users.
        sponsor.isViewer === undefined ? 'ORGANIZATION' : 'INDIVIDUAL',
      monthlyDonation: tier.monthlyPriceInDollars * 100,
      source: 'github',
      tier: getTierSlug(tier.monthlyPriceInDollars),
    })
  );
}

async function fetchSponsors(): Promise<Sponsor[]> {
  const openCollectiveSponsors = fetchOpenCollectiveSponsors();
  const githubSponsors = fetchGitHubSponsors();

  return [...(await openCollectiveSponsors), ...(await githubSponsors)];
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

const professionalToBackerOverrides = new Map([
  ['Vasy Kafidoff', 'https://kafidoff.com'],
]);

const sponsors = await fetchSponsors();

// Remove sponsors that are already in the pre-propulated headliners
for (let i = 0; i < sponsors.length; i++) {
  if (
    tierSponsors.headliner.some((sponsor) => sponsor.url === sponsors[i].url)
  ) {
    sponsors.splice(i, 1);
    i--;
  }
}

sponsors.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

// Process into a useful format
for (const sponsor of sponsors) {
  if (
    sponsor.tier !== 'sponsor' &&
    (!sponsor.tier ||
      sponsor.type === 'ORGANIZATION' ||
      MISLABELED_ORGS.test(sponsor.name) ||
      MISLABELED_ORGS.test(sponsor.url))
  ) {
    continue;
  }

  if (
    (sponsor.tier === 'professional' || sponsor.tier === 'backer') &&
    professionalToBackerOverrides.has(sponsor.name)
  ) {
    sponsor.url = professionalToBackerOverrides.get(sponsor.name)!;
  }

  tierSponsors[sponsor.tier].push(sponsor);
}

for (const tier of Object.values(tierSponsors)) {
  // Sort order based on total donations
  tier.sort((a: Sponsor, b: Sponsor) => b.monthlyDonation - a.monthlyDonation);

  // Set all montly donations to 0
  for (const sponsor of tier) {
    sponsor.monthlyDonation = 0;
  }
}

// Write sponsors.json
await fs.writeFile(JSON_PATH, JSON.stringify(tierSponsors, null, 2), 'utf8');

// Merge professionals into backers for now
tierSponsors.backer.unshift(...tierSponsors.professional);

let readme = await fs.readFile(README_PATH, 'utf8');

for (let sectionStartIndex = 0; ; ) {
  sectionStartIndex = readme.indexOf(
    SECTION_START_BEGINNING,
    sectionStartIndex
  );

  if (sectionStartIndex < 0) break;

  sectionStartIndex += SECTION_START_BEGINNING.length;

  const sectionStartEndIndex = readme.indexOf(
    SECTION_START_END,
    sectionStartIndex
  );
  const sectionName = readme
    .slice(sectionStartIndex, sectionStartEndIndex)
    .trim() as Tier;

  const sectionContentStart = sectionStartEndIndex + SECTION_START_END.length;

  const sectionEndIndex = readme.indexOf(SECTION_END, sectionContentStart);

  readme = `${readme.slice(0, sectionContentStart)}\n\n${tierSponsors[
    sectionName
  ]
    .map(
      (s: Sponsor) =>
        // Display each sponsor's image in the README.
        `<a href="${s.url}" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="${imgix.buildURL(s.image, {
              w: 128,
              h: 128,
              fit: 'fillmax',
              fill: 'solid',
            })}" title="${s.name}" alt="${s.name}"></img>
          </a>`
    )
    .join('\n')}\n\n${readme.slice(sectionEndIndex)}`;
}

await fs.writeFile(README_PATH, readme, {
  encoding: 'utf8',
});
