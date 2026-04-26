import type { ParsedSlip, Platform } from '@/types';

// Maps our platform IDs to convertbetcodes.com bookie:country format
const CBC_ID: Partial<Record<Platform, string>> = {
  bet9ja:   'bet9ja:ng',
  sportybet: 'sportybet:ng',
  '1xbet':  '1xbet:ng',
  betking:  'betking:ng',
};

async function fetchConvertedCode(
  fromId: string,
  toId: string,
  bookingCode: string
): Promise<string | null> {
  const apiKey = process.env.CONVERTBET_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://api.convertbetcodes.com/v1/conversion?from=${fromId}&to=${toId}&booking_code=${encodeURIComponent(bookingCode)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    // API may return code under different keys depending on version
    return data.booking_code ?? data.code ?? data.result ?? null;
  } catch {
    return null;
  }
}

export async function generateBookingCodes(
  slip: ParsedSlip,
  targetPlatforms: Platform[]
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};

  // Real code generation is only possible when the source input was a booking code
  if (!slip.isBookingCode || !slip.bookingCode || slip.sourcePlatform === 'unknown') {
    for (const p of targetPlatforms) result[p] = null;
    return result;
  }

  const fromId = CBC_ID[slip.sourcePlatform];
  if (!fromId) {
    for (const p of targetPlatforms) result[p] = null;
    return result;
  }

  await Promise.all(
    targetPlatforms.map(async (target) => {
      const toId = CBC_ID[target];
      result[target] = toId
        ? await fetchConvertedCode(fromId, toId, slip.bookingCode!)
        : null;
    })
  );

  return result;
}
