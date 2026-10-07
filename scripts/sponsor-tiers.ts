/** Recognition levels for eligible sponsors. */
export type Tier = 'headliner' | 'sponsor' | 'professional' | 'backer';

/**
 * Returns the tier supported by both the monthly amount and completed donations.
 *
 * @param monthlyDonation - The monthly donation in dollars.
 * @param totalDonations - Completed donations in dollars, when available.
 * @returns The ID of the tier the donation belongs to.
 */
export function getTierSlug(
  monthlyDonation: number,
  totalDonations: number = monthlyDonation,
): Tier | null {
  const eligibleDonation = Math.min(monthlyDonation, totalDonations);

  if (eligibleDonation >= 250) {
    return 'headliner';
  }

  if (eligibleDonation >= 100) {
    return 'sponsor';
  }

  if (eligibleDonation >= 25) {
    return 'professional';
  }

  if (eligibleDonation >= 5) {
    return 'backer';
  }

  return null;
}
