/**
 * @file Script To fetch sponsor data from Open Collective and GitHub.
 *
 *   Adapted from
 *   https://github.com/eslint/website/blob/230e73457dcdc2353ad7934e876a5a222a17b1d7/_tools/fetch-sponsors.js.
 */

// eslint-disable-next-line node/no-missing-import
import * as fs from 'node:fs/promises';
import fetch from 'node-fetch';
import { graphql as githubGraphQL } from '@octokit/graphql';

type Tier = 'sponsor' | 'professional' | 'backer';

interface Sponsor {
  name: string;
  image: string;
  url: string;
  type: 'ORGANIZATION' | 'INDIVIDUAL' | 'FUND';
  monthlyDonation: number;
  source: 'github' | 'opencollective';
  tier: Tier;
}

const tierSponsors: Record<Tier, Sponsor[]> = {
  sponsor: [],
  professional: [],
  backer: [],
};

const { CHEERIO_SPONSORS_GITHUB_TOKEN } = process.env;

if (!CHEERIO_SPONSORS_GITHUB_TOKEN) {
  throw new Error('Missing CHEERIO_SPONSORS_GITHUB_TOKEN.');
}

/**
 * Returns the tier ID for a given donation amount.
 *
 * @param monthlyDonation - The monthly donation in dollars.
 * @returns The ID of the tier the donation belongs to.
 */
function getTierSlug(monthlyDonation: number): Tier {
  if (monthlyDonation >= 100) {
    return 'sponsor';
  }

  if (monthlyDonation >= 25) {
    return 'professional';
  }

  return 'backer';
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
            totalCount
            nodes {
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

  const result = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const payload = await result.json();

  return payload.data.account.orders.nodes.map((order: any) => {
    const monthlyDonation =
      order.frequency === 'year'
        ? Math.round((order.amount.value * 100) / 12)
        : order.amount.value * 100;

    return {
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
  const { organization } = await githubGraphQL(
    `query {
      organization(login: "cheeriojs") {
        sponsorshipsAsMaintainer (first: 100) {
          nodes {
            sponsor: sponsorEntity {
              ...on User {
                name,
                login,
                avatarUrl,
                url,
                websiteUrl,
                isViewer
              }
              ...on Organization {
                name,
                login,
                avatarUrl,
                url,
                websiteUrl
              }
            },
            tier {
              monthlyPriceInDollars
            }
          }
        }
      }
    }`,
    {
      headers: {
        authorization: `token ${CHEERIO_SPONSORS_GITHUB_TOKEN}`,
      },
    }
  );

  // Return an array in the same format as Open Collective
  return organization.sponsorshipsAsMaintainer.nodes.map(
    ({ sponsor, tier }: any) => ({
      name: sponsor.name,
      image: `${sponsor.avatarUrl}&s=128`,
      url: sponsor.websiteUrl || sponsor.url,
      type:
        // Workaround to get the type — fetch a field that only exists on users.
        typeof sponsor.isViewer === 'undefined' ? 'ORGANIZATION' : 'INDIVIDUAL',
      monthlyDonation: tier.monthlyPriceInDollars * 100,
      source: 'github',
      tier: getTierSlug(tier.monthlyPriceInDollars),
    })
  );
}

/*
 * Remove sponsors from lower tiers that have individual accounts,
 * but are clearly orgs.
 */
const MISLABELED_ORGS = /[ck]as[yi]+no|bet$|poker|coffee/i;

const README_PATH = `${__dirname}/../Readme.md`;

const SECTION_START_BEGINNING = '<!-- BEGIN SPONSORS:';
const SECTION_START_END = '-->';
const SECTION_END = '<!-- END SPONSORS -->';

(async () => {
  const [openCollectiveSponsors, githubSponsors] = await Promise.all([
    fetchOpenCollectiveSponsors(),
    fetchGitHubSponsors(),
  ]);

  const sponsors = [...openCollectiveSponsors, ...githubSponsors];

  // Process into a useful format
  for (const sponsor of sponsors) {
    if (
      sponsor.tier !== 'sponsor' &&
      (sponsor.type === 'ORGANIZATION' || MISLABELED_ORGS.test(sponsor.name))
    ) {
      continue;
    }

    tierSponsors[sponsor.tier].push(sponsor);
  }

  // Sort order based on total donations
  for (const key of Object.keys(tierSponsors) as Tier[]) {
    tierSponsors[key].sort(
      (a: Sponsor, b: Sponsor) => b.monthlyDonation - a.monthlyDonation
    );
  }

  // Merge professionals into sponsors for now
  tierSponsors.sponsor.push(...tierSponsors.professional);

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
          `<a href="${s.url}" target="_blank">![${s.name}](${s.image})</a>`
      )
      .join('\n')}\n\n${readme.slice(sectionEndIndex)}`;
  }

  await fs.writeFile(README_PATH, readme, {
    encoding: 'utf8',
  });
})();
