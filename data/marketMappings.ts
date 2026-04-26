import type { MarketCode } from '@/types';

export interface MarketInfo {
  code: MarketCode;
  displayName: string;
  selectionAliases: Record<string, string>;
  platformNames: Record<string, string>;
}

export const MARKETS: Record<string, MarketInfo> = {
  '1x2': {
    code: '1X2',
    displayName: 'Match Result (1X2)',
    selectionAliases: {
      '1': '1',
      'home': '1',
      'home win': '1',
      'home team wins': '1',
      'x': 'X',
      'draw': 'X',
      'tie': 'X',
      '2': '2',
      'away': '2',
      'away win': '2',
      'away team wins': '2',
    },
    platformNames: {
      bet9ja: '1X2',
      sportybet: 'Full Time Result',
      '1xbet': 'Match Result',
      betking: '1X2',
    },
  },

  over_under: {
    code: 'OVER_UNDER',
    displayName: 'Over/Under',
    selectionAliases: {
      'over': 'Over',
      'o': 'Over',
      'more than': 'Over',
      'under': 'Under',
      'u': 'Under',
      'less than': 'Under',
    },
    platformNames: {
      bet9ja: 'Over/Under',
      sportybet: 'Goal Lines',
      '1xbet': 'Total',
      betking: 'Over/Under',
    },
  },

  btts: {
    code: 'BTTS',
    displayName: 'Both Teams to Score',
    selectionAliases: {
      'yes': 'Yes',
      'gg': 'Yes',
      'both teams score': 'Yes',
      'no': 'No',
      'ng': 'No',
      'not both': 'No',
    },
    platformNames: {
      bet9ja: 'Both Teams To Score',
      sportybet: 'Both Teams to Score',
      '1xbet': 'Both Teams To Score',
      betking: 'GG/NG',
    },
  },

  double_chance: {
    code: 'DOUBLE_CHANCE',
    displayName: 'Double Chance',
    selectionAliases: {
      '1x': '1X',
      'home or draw': '1X',
      '12': '12',
      'home or away': '12',
      'either team wins': '12',
      'x2': 'X2',
      'draw or away': 'X2',
    },
    platformNames: {
      bet9ja: 'Double Chance',
      sportybet: 'Double Chance',
      '1xbet': 'Double Chance',
      betking: 'Double Chance',
    },
  },

  draw_no_bet: {
    code: 'DRAW_NO_BET',
    displayName: 'Draw No Bet',
    selectionAliases: {
      'home': 'Home',
      '1': 'Home',
      'away': 'Away',
      '2': 'Away',
    },
    platformNames: {
      bet9ja: 'Draw No Bet',
      sportybet: 'Draw No Bet',
      '1xbet': 'Draw No Bet',
      betking: 'Draw No Bet',
    },
  },

  correct_score: {
    code: 'CORRECT_SCORE',
    displayName: 'Correct Score',
    selectionAliases: {},
    platformNames: {
      bet9ja: 'Correct Score',
      sportybet: 'Correct Score',
      '1xbet': 'Exact Score',
      betking: 'Correct Score',
    },
  },

  halftime_result: {
    code: 'HALFTIME_RESULT',
    displayName: 'Half Time Result',
    selectionAliases: {
      '1': '1',
      'home': '1',
      'x': 'X',
      'draw': 'X',
      '2': '2',
      'away': '2',
    },
    platformNames: {
      bet9ja: 'Half Time',
      sportybet: 'First Half Result',
      '1xbet': 'Halftime',
      betking: '1st Half Result',
    },
  },

  asian_handicap: {
    code: 'ASIAN_HANDICAP',
    displayName: 'Asian Handicap',
    selectionAliases: {
      'home': 'Home',
      'away': 'Away',
    },
    platformNames: {
      bet9ja: 'Asian Handicap',
      sportybet: 'Asian Handicap',
      '1xbet': 'Asian Handicap',
      betking: 'Asian Handicap',
    },
  },
};

const MARKET_KEYWORD_MAP: Array<[RegExp, string]> = [
  [/\b(?:1x2|match\s+result|full.?time\s+result|ftr|1\s*\/\s*x\s*\/\s*2|match\s+outcome|ft\s+result)\b/i, '1x2'],
  [/\b(?:over|under|o\/u|total\s+goals?|goal\s+line)\b/i, 'over_under'],
  [/\b(?:btts|both\s+teams?\s+(?:to\s+)?score|gg|ng|g\/g|n\/g)\b/i, 'btts'],
  [/\b(?:double\s+chance|dc)\b/i, 'double_chance'],
  [/\b(?:draw\s+no\s+bet|dnb)\b/i, 'draw_no_bet'],
  [/\b(?:correct\s+score|exact\s+score|cs)\b/i, 'correct_score'],
  [/\b(?:half.?time\s+result|ht\s+result|1st\s+half|first\s+half\s+result)\b/i, 'halftime_result'],
  [/\b(?:asian\s+handicap|ah|handicap)\b/i, 'asian_handicap'],
];

export function detectMarketFromText(text: string): MarketInfo | null {
  for (const [pattern, key] of MARKET_KEYWORD_MAP) {
    if (pattern.test(text)) return MARKETS[key] ?? null;
  }
  return null;
}

export function getMarketByCode(code: MarketCode): MarketInfo | null {
  return Object.values(MARKETS).find((m) => m.code === code) ?? null;
}
