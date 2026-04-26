import type {
  ParsedSlip,
  PlatformSlip,
  ConvertedSelection,
  Platform,
  BookingStep,
  MarketCode,
} from '@/types';
import { getMarketByCode } from '@/data/marketMappings';
import { buildSearchQuery } from '@/lib/normalizer';


interface PlatformConfig {
  id: Platform;
  name: string;
  logoColor: string;
  baseUrl: string;
  affiliateUrl: string;
  searchUrl: string;
  canDeepLink: boolean;
  bookingCodeUrl?: string;
  bookingCodeInstruction: string;
  oddsMultiplier: number;
}

const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: 'bet9ja',
    name: 'Bet9ja',
    logoColor: '#009A44',
    baseUrl: 'https://web.bet9ja.com',
    affiliateUrl: 'https://web.bet9ja.com/?utm_source=oddvara&utm_medium=referral&utm_campaign=convert',
    searchUrl: 'https://web.bet9ja.com/Sport#',
    canDeepLink: false,
    bookingCodeUrl: 'https://web.bet9ja.com/Sport#/booking/',
    bookingCodeInstruction: 'After adding all selections, click "Book Bet" at the bottom of your betslip — your booking code will appear instantly.',
    oddsMultiplier: 1.00,
  },
  {
    id: 'sportybet',
    name: 'SportyBet',
    logoColor: '#E63946',
    baseUrl: 'https://www.sportybet.com/ng',
    affiliateUrl: 'https://www.sportybet.com/ng/?utm_source=oddvara&utm_medium=referral&utm_campaign=convert',
    searchUrl: 'https://www.sportybet.com/ng/sport/football',
    canDeepLink: false,
    bookingCodeUrl: 'https://www.sportybet.com/ng/sharecode/',
    bookingCodeInstruction: 'After adding all selections, tap the "Share" icon on your betslip — SportyBet will generate a booking code you can copy and share.',
    oddsMultiplier: 0.98,
  },
  {
    id: '1xbet',
    name: '1xBet',
    logoColor: '#1E90FF',
    baseUrl: 'https://1xbet.ng',
    affiliateUrl: 'https://1xbet.ng/?utm_source=oddvara&utm_medium=referral&utm_campaign=convert',
    searchUrl: 'https://1xbet.ng/en/sport/football',
    canDeepLink: false,
    bookingCodeUrl: 'https://1xbet.ng/en/coupon/',
    bookingCodeInstruction: 'After adding all selections, click "Save Coupon" in the coupon panel — 1xBet will generate a coupon code you can share or load on any device.',
    oddsMultiplier: 1.04,
  },
  {
    id: 'betking',
    name: 'BetKing',
    logoColor: '#FF6B00',
    baseUrl: 'https://www.betking.com',
    affiliateUrl: 'https://www.betking.com/?utm_source=oddvara&utm_medium=referral&utm_campaign=convert',
    searchUrl: 'https://www.betking.com/sports/s#/football/',
    canDeepLink: false,
    bookingCodeUrl: 'https://www.betking.com/booking-code',
    bookingCodeInstruction: 'After adding all selections, click "Share Bet" on your betslip — BetKing will display a booking code your friends can use to load the same slip.',
    oddsMultiplier: 1.01,
  },
];

function getPlatformMarketName(marketCode: MarketCode, platform: Platform): string {
  const info = getMarketByCode(marketCode);
  if (!info) return 'Unknown Market';
  return info.platformNames[platform] ?? info.displayName;
}

function getPlatformSelection(selectionNormalized: string, marketCode: MarketCode, platform: Platform): string {
  // Platform-specific selection display names
  const overUnderMatch = selectionNormalized.match(/^(Over|Under)\s*(\d+\.?\d*)$/i);
  if (overUnderMatch) {
    const direction = overUnderMatch[1];
    const line = overUnderMatch[2];
    if (platform === '1xbet') return `${direction}(${line})`;
    return `${direction} ${line}`;
  }

  const selectionMap: Record<Platform, Record<string, string>> = {
    bet9ja: { '1': '1', 'X': 'X', '2': '2', 'Yes': 'Yes', 'No': 'No', 'Over': 'Over', 'Under': 'Under', 'Home': '1', 'Away': '2', 'Draw': 'X' },
    sportybet: { '1': '1', 'X': 'X', '2': '2', 'Yes': 'Yes', 'No': 'No', 'Over': 'Over', 'Under': 'Under', 'Home': 'Home Win', 'Away': 'Away Win', 'Draw': 'Draw' },
    '1xbet': { '1': '1', 'X': 'X', '2': '2', 'Yes': 'Yes', 'No': 'No', 'Over': 'Over', 'Under': 'Under', 'Home': '1', 'Away': '2', 'Draw': 'X' },
    betking: { '1': '1', 'X': 'X', '2': '2', 'Yes': 'GG', 'No': 'NG', 'Over': 'Over', 'Under': 'Under', 'Home': '1', 'Away': '2', 'Draw': 'X' },
    unknown: {},
  };

  return selectionMap[platform]?.[selectionNormalized] ?? selectionNormalized;
}

function buildBookingGuide(
  config: PlatformConfig,
  selections: ConvertedSelection[],
): BookingStep[] {
  const steps: BookingStep[] = [];
  let step = 1;

  steps.push({
    step: step++,
    instruction: `Open ${config.name}`,
    detail: `Visit ${config.baseUrl} or open the ${config.name} mobile app`,
  });

  if (selections.length === 1 && selections[0].original.marketCode !== 'UNKNOWN') {
    const sel = selections[0];
    steps.push({
      step: step++,
      instruction: `Search for the match`,
      detail: `Search: "${sel.searchQuery}" in the Sports section`,
    });
    steps.push({
      step: step++,
      instruction: `Find the market`,
      detail: `Select "${sel.platformMarket}" from the available markets`,
    });
    steps.push({
      step: step++,
      instruction: `Add your selection`,
      detail: `Click "${sel.platformSelection}" ${sel.original.odds > 0 ? `(odds around ${sel.original.odds.toFixed(2)})` : ''} to add it to your betslip`,
    });
  } else {
    steps.push({
      step: step++,
      instruction: `Go to Football section`,
      detail: `Navigate to Sports → Football → your target leagues`,
    });

    selections.forEach((sel, idx) => {
      steps.push({
        step: step++,
        instruction: `Add Selection ${idx + 1}: ${sel.searchQuery}`,
        detail: `Market: ${sel.platformMarket} → Pick: "${sel.platformSelection}" ${sel.original.odds > 0 ? `@ ~${sel.original.odds.toFixed(2)}` : ''}`,
      });
    });
  }

  steps.push({
    step: step++,
    instruction: `Get your booking code`,
    detail: config.bookingCodeInstruction,
  });

  return steps;
}

export function convertSlip(slip: ParsedSlip, targetPlatforms: Platform[]): PlatformSlip[] {
  return targetPlatforms.map((platformId) => {
    const config = PLATFORM_CONFIGS.find((p) => p.id === platformId);
    if (!config) {
      return {
        platform: platformId,
        platformName: platformId,
        logoColor: '#666',
        platformUrl: '',
        affiliateUrl: '',
        selections: [],
        bookingGuide: [],
        overallConfidence: 0,
        canAutoLink: false,
        bookingCodeInstruction: '',
        bookingCode: null,
      };
    }

    const convertedSelections: ConvertedSelection[] = slip.selections.map((sel) => {
      const platformMarket = getPlatformMarketName(sel.marketCode, platformId);
      const platformSelection = getPlatformSelection(sel.selectionNormalized, sel.marketCode, platformId);
      const searchQuery = buildSearchQuery(sel);

      return {
        original: sel,
        platformMarket,
        platformSelection,
        platformOdds: sel.odds,
        searchQuery,
        confidence: sel.confidence,
      };
    });

    const overallConfidence =
      convertedSelections.length > 0
        ? Math.round(convertedSelections.reduce((a, s) => a + s.confidence, 0) / convertedSelections.length)
        : 0;

    const estimatedTotalOdds = convertedSelections.reduce(
      (acc, s) => (s.original.odds > 0 ? acc * s.original.odds : acc),
      1
    );

    const bookingGuide = buildBookingGuide(config, convertedSelections);

    const adjustedTotalOdds = parseFloat((estimatedTotalOdds * config.oddsMultiplier).toFixed(2));

    return {
      platform: platformId,
      platformName: config.name,
      logoColor: config.logoColor,
      platformUrl: config.baseUrl,
      affiliateUrl: config.affiliateUrl,
      selections: convertedSelections,
      deepLink: config.canDeepLink ? `${config.searchUrl}` : undefined,
      bookingGuide,
      overallConfidence,
      estimatedTotalOdds: parseFloat(estimatedTotalOdds.toFixed(2)),
      adjustedTotalOdds,
      canAutoLink: config.canDeepLink,
      bookingCodeInstruction: config.bookingCodeInstruction,
      bookingCode: null,
    };
  });
}
