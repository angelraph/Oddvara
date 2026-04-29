import type { Platform } from '@/types';

// Relaxed to allow OCR artefacts (digits, |) inside team names
export const TEAM_VS_TEAM =
  /([A-Za-zÀ-ÿ0-9\s\.\'\-&|]{2,35}?)\s+(?:vs?\.?\s*|versus\s*|V\/S\s*|-{1,3}\s*)\s*([A-Za-zÀ-ÿ0-9\s\.\'\-&|]{2,35})/i;

export const BOOKING_CODE_GENERIC = /(?:booking|code|id|ref(?:erence)?)\s*[:=\-#]?\s*([A-Z0-9\-_]{4,20})/i;
export const DECIMAL_ODDS = /(?:odds?|coeff(?:icient)?|@|x)\s*:?\s*(\d+\.\d+)/i;
export const DECIMAL_ODDS_STANDALONE = /\b(\d+\.\d{1,2})\b/g;
export const FRACTIONAL_ODDS = /(\d+)\/(\d+)/;
export const NUMBERED_SELECTION = /^\s*(\d+)[.\)]\s*/;
export const OVER_UNDER_LINE = /(?:over|under|o\/u)[^\d]*(\d+\.?\d*)/i;
export const CORRECT_SCORE = /(\d+)\s*[-:]\s*(\d+)/;
export const MATCH_TIME = /(\d{1,2}[\/\-\.]\d{2}[\/\-\.]\d{2,4}|\d{1,2}:\d{2}(?:\s?(?:AM|PM))?)/i;

// Platform code format patterns — used to auto-detect which platform a booking code belongs to
export const CODE_PATTERNS: Partial<Record<Platform, RegExp>> = {
  sportybet: /^SB[A-Z0-9]{4,12}$/i,
  bet9ja: /^(B9J|BJ)[A-Z0-9]{4,12}$|^\d{7,12}$/i,
  '1xbet': /^(1X|1XNG[-]?)[A-Z0-9\-]{3,20}$/i,
  betking: /^BK[A-Z0-9]{4,12}$/i,
  // Stake.com: share URLs or cuid-style IDs (25 chars, lowercase alphanumeric)
  stake: /stake\.com|^[a-z0-9]{20,30}$/,
};

export const PLATFORM_MARKERS: Record<string, string[]> = {
  bet9ja: ['bet9ja', 'b9j', 'bet 9ja'],
  sportybet: ['sportybet', 'sporty bet', 'sporty'],
  '1xbet': ['1xbet', '1x bet', '1xng', '1x', 'xbet'],
  betking: ['betking', 'bet king'],
  stake: ['stake.com', 'stake', 'stake sports'],
};

export function detectPlatformFromText(text: string): string {
  const lower = text.toLowerCase();
  for (const [platform, markers] of Object.entries(PLATFORM_MARKERS)) {
    if (markers.some((m) => lower.includes(m))) return platform;
  }
  return 'unknown';
}

export function detectPlatformFromCode(rawCode: string): Platform {
  const code = rawCode.trim();
  for (const [platform, pattern] of Object.entries(CODE_PATTERNS)) {
    if (pattern && pattern.test(code)) return platform as Platform;
  }
  return 'unknown';
}

export function extractBookingCode(text: string): string | undefined {
  const match = text.match(BOOKING_CODE_GENERIC);
  return match?.[1];
}

export function extractOdds(text: string): number | null {
  const explicit = text.match(DECIMAL_ODDS);
  if (explicit) {
    const val = parseFloat(explicit[1]);
    if (val >= 1.01 && val <= 1000) return val;
  }

  const fractional = text.match(FRACTIONAL_ODDS);
  if (fractional) {
    const num = parseInt(fractional[1]);
    const den = parseInt(fractional[2]);
    if (den > 0) return parseFloat((num / den + 1).toFixed(2));
  }

  // Fallback: find any standalone decimal that looks like odds
  const re = new RegExp(DECIMAL_ODDS_STANDALONE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const val = parseFloat(m[1]);
    const before = text.substring(Math.max(0, m.index - 3), m.index);
    if (val >= 1.01 && val <= 200 && !before.includes(':')) {
      return val;
    }
  }

  return null;
}
