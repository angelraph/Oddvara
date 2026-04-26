export const TEAM_VS_TEAM = /([A-Za-zÀ-ÿ\s\.\'\-&]+?)\s+(?:vs?\.?|versus|-+|\/)\s+([A-Za-zÀ-ÿ\s\.\'\-&]+)/i;
export const BOOKING_CODE_GENERIC = /(?:booking|code|id|ref(?:erence)?)\s*[:=\-#]?\s*([A-Z0-9\-_]{4,20})/i;
export const DECIMAL_ODDS = /(?:odds?|coeff(?:icient)?|@|x)\s*:?\s*(\d+\.\d+)/i;
export const DECIMAL_ODDS_STANDALONE = /\b(\d+\.\d{1,2})\b/g;
export const FRACTIONAL_ODDS = /(\d+)\/(\d+)/;
export const NUMBERED_SELECTION = /^\s*(\d+)[.\)]\s*/;
export const OVER_UNDER_LINE = /(?:over|under|o\/u)[^\d]*(\d+\.?\d*)/i;
export const CORRECT_SCORE = /(\d+)\s*[-:]\s*(\d+)/;
export const MATCH_TIME = /(\d{1,2}[\/\-\.]\d{2}[\/\-\.]\d{2,4}|\d{1,2}:\d{2}(?:\s?(?:AM|PM))?)/i;

export const PLATFORM_MARKERS: Record<string, string[]> = {
  bet9ja: ['bet9ja', 'b9j', 'bet 9ja'],
  sportybet: ['sportybet', 'sporty bet', 'sporty'],
  '1xbet': ['1xbet', '1x bet', '1xng', '1x', 'xbet'],
  betking: ['betking', 'bet king'],
};

export function detectPlatformFromText(text: string): string {
  const lower = text.toLowerCase();
  for (const [platform, markers] of Object.entries(PLATFORM_MARKERS)) {
    if (markers.some((m) => lower.includes(m))) return platform;
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
