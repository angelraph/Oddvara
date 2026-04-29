import type { ParsedSlip, Platform } from '@/types';

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
    return data.booking_code ?? data.code ?? data.result ?? null;
  } catch {
    return null;
  }
}

function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

function deterministicCode(platform: Platform, slip: ParsedSlip): string {
  const seed = [
    platform,
    slip.bookingCode ?? '',
    ...slip.selections.map(
      (s) =>
        `${s.homeTeamNormalized}|${s.awayTeamNormalized}|${s.selectionNormalized}|${s.odds.toFixed(2)}`
    ),
  ].join('~');

  const n = fnv1a(seed);
  const b36 = n.toString(36).toUpperCase().padStart(8, '0');

  switch (platform) {
    case 'bet9ja':    return b36.slice(0, 7);
    case 'sportybet': return `SB${b36.slice(0, 6)}`;
    case '1xbet':     return `1XNG-${b36.slice(0, 4)}-${b36.slice(4, 8)}`;
    case 'betking':   return `BK${b36.slice(0, 6)}`;
    default:          return b36.slice(0, 7);
  }
}

export interface CodeResult {
  code: string;
  isReal: boolean;
}

export async function generateBookingCodes(
  slip: ParsedSlip,
  targetPlatforms: Platform[]
): Promise<Record<string, CodeResult>> {
  const result: Record<string, CodeResult> = {};

  // Try the real API whenever we have a source booking code (decoded or not)
  const canTryApi = !!slip.bookingCode && slip.sourcePlatform !== 'unknown';
  const fromId = canTryApi ? CBC_ID[slip.sourcePlatform] : undefined;

  await Promise.all(
    targetPlatforms.map(async (target) => {
      let realCode: string | null = null;

      if (canTryApi && fromId) {
        const toId = CBC_ID[target];
        if (toId) realCode = await fetchConvertedCode(fromId, toId, slip.bookingCode!);
      }

      if (realCode) {
        result[target] = { code: realCode, isReal: true };
      } else {
        result[target] = { code: deterministicCode(target, slip), isReal: false };
      }
    })
  );

  return result;
}
