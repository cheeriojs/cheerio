import { afterEach, describe, expect, it, vi } from 'vitest';

const { writeFile, request } = vi.hoisted(() => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  request: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  readFile: vi
    .fn()
    .mockResolvedValue(
      '<!-- BEGIN SPONSORS: headliner -->\n<!-- END SPONSORS -->\n' +
        '<!-- BEGIN SPONSORS: sponsor -->\n<!-- END SPONSORS -->\n' +
        '<!-- BEGIN SPONSORS: backer -->\n<!-- END SPONSORS -->\n',
    ),
  writeFile,
}));

vi.mock('undici', () => ({ request }));
vi.mock('@octokit/graphql', () => ({
  graphql: vi.fn().mockResolvedValue({
    organization: { sponsorshipsAsMaintainer: { nodes: [] } },
  }),
}));

describe('sponsor generation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('omits an underpaid order from both outputs while keeping paid monthly and annual sponsors', async () => {
    vi.stubEnv('CHEERIO_SPONSORS_GITHUB_TOKEN', 'test-token');
    vi.stubEnv('IMGIX_TOKEN', 'test-token');
    vi.spyOn(console, 'log').mockImplementation(vi.fn());

    const orders = [
      {
        name: 'buy youtube subscribers',
        amount: 100,
        paid: 2,
        frequency: 'MONTHLY',
      },
      {
        name: 'Paid monthly sponsor',
        amount: 100,
        paid: 100,
        frequency: 'MONTHLY',
      },
      {
        name: 'Paid annual sponsor',
        amount: 1200,
        paid: 1200,
        frequency: 'YEARLY',
      },
    ].map(({ name, amount, paid, frequency }) => ({
      createdAt: '2026-10-06T21:10:10.932Z',
      fromAccount: {
        name,
        website: 'https://example.com/',
        imageUrl: 'https://example.com/logo.png',
        type: 'ORGANIZATION',
      },
      amount: { value: amount },
      totalDonations: { value: paid },
      frequency,
    }));

    request.mockResolvedValue({
      body: {
        json: vi.fn().mockResolvedValue({
          data: { account: { orders: { nodes: orders } } },
        }),
      },
    });

    await import('./fetch-sponsors.mjs');

    expect(writeFile).toHaveBeenCalledTimes(2);
    const [jsonCall, readmeCall] = writeFile.mock.calls as [
      [URL, string, string],
      [URL, string, string],
    ];
    expect(jsonCall[0].pathname.endsWith('/website/sponsors.json')).toBe(true);
    expect(readmeCall[0].pathname.endsWith('/Readme.md')).toBe(true);

    const sponsors = JSON.parse(jsonCall[1]) as {
      sponsor: { name: string; tier: string }[];
    };
    expect(sponsors.sponsor).toEqual([
      expect.objectContaining({ name: 'Paid annual sponsor', tier: 'sponsor' }),
      expect.objectContaining({
        name: 'Paid monthly sponsor',
        tier: 'sponsor',
      }),
    ]);
    expect(jsonCall[1]).not.toContain('buy youtube subscribers');
    expect(readmeCall[1]).not.toContain('buy youtube subscribers');
    expect(readmeCall[1]).toContain('Paid monthly sponsor');
    expect(readmeCall[1]).toContain('Paid annual sponsor');
  });
});
