import { nanoid } from 'nanoid';
import type { ParsedSlip, BetSelection, Platform, BetType, MarketCode } from '@/types';
import { detectPlatformFromText, extractBookingCode, extractOdds, TEAM_VS_TEAM, OVER_UNDER_LINE, CORRECT_SCORE, NUMBERED_SELECTION } from './patterns';
import { normalizeTeamName } from '@/data/teamMappings';
import { detectMarketFromText } from '@/data/marketMappings';

// Lines that mark the end of selections (footer sentinels)
const FOOTER_SENTINEL = /^(?:total|stake|potential|payout|amount|winning|balance|date|booking|code|slip|ref|ticket|bet\s*id)/i;

const MAX_WINDOW_LINES = 7;

/**
 * Groups raw text lines into per-selection windows.
 *
 * When a team-vs-team line is found, it opens a new window and
 * collects the following lines (market, selection, odds) up to
 * MAX_WINDOW_LINES. This handles SportyBet / 1xBet / Bet9ja formats
 * where each selection spans multiple lines.
 *
 * Falls back to double-newline sections, numbered items, or per-line
 * if no team patterns are detected.
 */
function groupLinesIntoWindows(text: string): string[] {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const windows: string[] = [];
  let current: string[] = [];

  function flush() {
    if (current.length > 0) {
      windows.push(current.join('\n'));
      current = [];
    }
  }

  for (const line of lines) {
    if (FOOTER_SENTINEL.test(line)) {
      flush();
      continue;
    }

    if (TEAM_VS_TEAM.test(line)) {
      flush();
      current.push(line);
      continue;
    }

    if (current.length > 0) {
      if (current.length < MAX_WINDOW_LINES) {
        current.push(line);
      } else {
        flush();
        if (line.length > 5) windows.push(line);
      }
      continue;
    }
    // Preamble line — no open window, skip
  }

  flush();

  // Fallback chain when no TEAM_VS_TEAM matches found
  if (windows.length === 0) {
    const sections = text.split(/\n\s*\n/).filter((s) => s.trim().length > 10);
    if (sections.length > 1) return sections;

    const numbered = text.split(/\n(?=\s*\d+[.)]\s)/);
    if (numbered.length > 1) return numbered;

    return lines.filter((l) => l.length > 5);
  }

  return windows;
}

function extractTeams(chunk: string): { home: string; away: string } | null {
  // Match only the first line — prevents market/odds text bleeding into team names
  const firstLine = chunk.split('\n')[0];
  const match = firstLine.match(TEAM_VS_TEAM);
  if (!match) return null;

  const home = match[1].replace(NUMBERED_SELECTION, '').trim();
  // Strip trailing digits, punctuation, and odds that OCR can attach to team name
  const away = match[2]
    .split('\n')[0]
    .replace(/[\s\d@\.,:\-]+$/, '')
    .trim();

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

    if (marketInfo.code === 'CORRECT_SCORE') {
      const csMatch = chunk.match(CORRECT_SCORE);
      selection = csMatch ? `${csMatch[1]}-${csMatch[2]}` : 'Unknown';
      selectionNormalized = selection;
      return { market: marketInfo.displayName, marketCode: 'CORRECT_SCORE', selection, selectionNormalized };
    }

    const lowerChunk = chunk.toLowerCase();
    for (const [alias, normalized] of Object.entries(marketInfo.selectionAliases)) {
      if (lowerChunk.includes(alias.toLowerCase())) {
        selection = alias;
        selectionNormalized = normalized;
        break;
      }
    }

    return { market: marketInfo.displayName, marketCode: marketInfo.code, selection, selectionNormalized };
  }

  // Fallback: try plain 1X2 indicators
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

function scoreConfidence(
  teams: { home: string; away: string } | null,
  odds: number | null,
  marketCode: MarketCode
): number {
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

  const chunks = groupLinesIntoWindows(rawText);
  const selections: BetSelection[] = [];

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (trimmed.length < 5) continue;

    const teams = extractTeams(trimmed);
    const odds = extractOdds(trimmed);
    const { market, marketCode, selection, selectionNormalized } = extractMarketAndSelection(trimmed);
    const confidence = scoreConfidence(teams, odds, marketCode);

    // Include if we have teams OR (valid odds AND known market)
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
