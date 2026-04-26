import { nanoid } from 'nanoid';
import type { ParsedSlip, BetSelection, Platform, BetType, MarketCode } from '@/types';
import { detectPlatformFromText, extractBookingCode, extractOdds, TEAM_VS_TEAM, OVER_UNDER_LINE, CORRECT_SCORE, NUMBERED_SELECTION } from './patterns';
import { normalizeTeamName } from '@/data/teamMappings';
import { detectMarketFromText } from '@/data/marketMappings';

function splitIntoChunks(text: string): string[] {
  // Try numbered items first: "1. ", "2. ", etc.
  const numbered = text.split(/\n(?=\s*\d+[.)]\s)/);
  if (numbered.length > 1) return numbered;

  // Try double-newline sections
  const sections = text.split(/\n\s*\n/).filter((s) => s.trim().length > 10);
  if (sections.length > 1) return sections;

  // Try per-line (for plain-text slips)
  const lines = text.split('\n').filter((l) => l.trim().length > 5);
  return lines;
}

function extractTeams(chunk: string): { home: string; away: string } | null {
  const match = chunk.match(TEAM_VS_TEAM);
  if (!match) return null;

  const home = match[1].replace(NUMBERED_SELECTION, '').trim();
  const away = match[2].trim().split('\n')[0].trim();

  if (home.length < 2 || away.length < 2) return null;
  return { home, away };
}

function extractMarketAndSelection(chunk: string): {
  market: string;
  marketCode: MarketCode;
  selection: string;
  selectionNormalized: string;
  overUnderLine?: number;
} {
  const marketInfo = detectMarketFromText(chunk);

  if (marketInfo) {
    let selection = 'Unknown';
    let selectionNormalized = 'Unknown';

    // Over/Under — extract line
    if (marketInfo.code === 'OVER_UNDER') {
      const ouMatch = chunk.match(OVER_UNDER_LINE);
      const line = ouMatch ? ouMatch[1] : '2.5';
      const isOver = /\bover\b/i.test(chunk);
      selection = isOver ? `Over ${line}` : `Under ${line}`;
      selectionNormalized = isOver ? 'Over' : 'Under';
      return {
        market: `${marketInfo.displayName} ${line}`,
        marketCode: 'OVER_UNDER',
        selection,
        selectionNormalized,
        overUnderLine: parseFloat(line),
      };
    }

    // Correct Score
    if (marketInfo.code === 'CORRECT_SCORE') {
      const csMatch = chunk.match(CORRECT_SCORE);
      selection = csMatch ? `${csMatch[1]}-${csMatch[2]}` : 'Unknown';
      selectionNormalized = selection;
      return { market: marketInfo.displayName, marketCode: 'CORRECT_SCORE', selection, selectionNormalized };
    }

    // Map selection from aliases
    const lowerChunk = chunk.toLowerCase();
    for (const [alias, normalized] of Object.entries(marketInfo.selectionAliases)) {
      if (lowerChunk.includes(alias.toLowerCase())) {
        selection = alias;
        selectionNormalized = normalized;
        break;
      }
    }

    return {
      market: marketInfo.displayName,
      marketCode: marketInfo.code,
      selection,
      selectionNormalized,
    };
  }

  // Default: try to find 1X2 indicator
  const match1 = chunk.match(/\b(1|home\s*win|home)\b/i);
  const matchX = chunk.match(/\b(x|draw|tie)\b/i);
  const match2 = chunk.match(/\b(2|away\s*win|away)\b/i);

  if (match1 && !matchX && !match2) {
    return { market: 'Match Result (1X2)', marketCode: '1X2', selection: 'Home (1)', selectionNormalized: '1' };
  }
  if (matchX) {
    return { market: 'Match Result (1X2)', marketCode: '1X2', selection: 'Draw (X)', selectionNormalized: 'X' };
  }
  if (match2 && !match1) {
    return { market: 'Match Result (1X2)', marketCode: '1X2', selection: 'Away (2)', selectionNormalized: '2' };
  }

  return { market: 'Unknown', marketCode: 'UNKNOWN', selection: 'Unknown', selectionNormalized: 'Unknown' };
}

function scoreConfidence(teams: { home: string; away: string } | null, odds: number | null, marketCode: MarketCode): number {
  let score = 0;
  if (teams) score += 35;
  if (odds !== null && odds >= 1.01) score += 25;
  if (marketCode !== 'UNKNOWN') score += 30;
  if (marketCode === '1X2' || marketCode === 'OVER_UNDER' || marketCode === 'BTTS') score += 10;
  return Math.min(score, 100);
}

export function parseSlipText(rawText: string): ParsedSlip {
  const platform = detectPlatformFromText(rawText) as Platform;
  const bookingCode = extractBookingCode(rawText);

  const chunks = splitIntoChunks(rawText);
  const selections: BetSelection[] = [];

  for (const chunk of chunks) {
    const trimmed = chunk.replace(NUMBERED_SELECTION, '').trim();

    // Skip header/footer lines
    if (/^(?:booking|total|stake|potential|date|platform|code|slip)/i.test(trimmed)) continue;
    if (trimmed.length < 8) continue;

    const teams = extractTeams(trimmed);
    const odds = extractOdds(trimmed);
    const { market, marketCode, selection, selectionNormalized } = extractMarketAndSelection(trimmed);
    const confidence = scoreConfidence(teams, odds, marketCode);

    // Only include if we have at least teams OR odds + market
    if (!teams && (!odds || marketCode === 'UNKNOWN')) continue;

    const homeTeam = teams?.home ?? 'Unknown';
    const awayTeam = teams?.away ?? 'Unknown';

    selections.push({
      id: nanoid(8),
      homeTeam,
      awayTeam,
      homeTeamNormalized: normalizeTeamName(homeTeam),
      awayTeamNormalized: normalizeTeamName(awayTeam),
      market,
      marketCode,
      selection,
      selectionNormalized,
      odds: odds ?? 0,
      confidence,
    });
  }

  const totalOdds = selections.reduce((acc, s) => (s.odds > 0 ? acc * s.odds : acc), 1);
  const betType: BetType = selections.length > 1 ? 'accumulator' : 'single';

  return {
    id: nanoid(12),
    sourcePlatform: platform,
    bookingCode,
    betType,
    selections,
    totalOdds: parseFloat(totalOdds.toFixed(2)),
    rawInput: rawText,
    parsedAt: new Date().toISOString(),
  };
}
