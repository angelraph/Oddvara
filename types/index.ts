export type Platform = 'bet9ja' | 'sportybet' | '1xbet' | 'betking' | 'unknown';
export type BetType = 'single' | 'accumulator' | 'system';
export type OddsFormat = 'decimal' | 'fractional' | 'american';
export type InputMethod = 'code' | 'text' | 'screenshot';

export type MarketCode =
  | '1X2'
  | 'OVER_UNDER'
  | 'BTTS'
  | 'DOUBLE_CHANCE'
  | 'DRAW_NO_BET'
  | 'CORRECT_SCORE'
  | 'HALFTIME_RESULT'
  | 'HTFT'
  | 'FIRST_GOALSCORER'
  | 'ASIAN_HANDICAP'
  | 'CORNERS'
  | 'CARDS'
  | 'UNKNOWN';

export interface BetSelection {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamNormalized: string;
  awayTeamNormalized: string;
  league?: string;
  matchTime?: string;
  market: string;
  marketCode: MarketCode;
  selection: string;
  selectionNormalized: string;
  odds: number;
  confidence: number;
}

export interface ParsedSlip {
  id: string;
  sourcePlatform: Platform;
  bookingCode?: string;
  isBookingCode?: boolean;
  betType: BetType;
  selections: BetSelection[];
  totalOdds: number;
  stake?: number;
  potentialWin?: number;
  rawInput?: string;
  parsedAt: string;
}

export interface ConvertedSelection {
  original: BetSelection;
  platformMarket: string;
  platformSelection: string;
  platformOdds?: number;
  searchQuery: string;
  confidence: number;
}

export interface PlatformSlip {
  platform: Platform;
  platformName: string;
  logoColor: string;
  platformUrl: string;
  selections: ConvertedSelection[];
  deepLink?: string;
  bookingGuide: BookingStep[];
  overallConfidence: number;
  estimatedTotalOdds?: number;
  canAutoLink: boolean;
  bookingCodeInstruction: string;
}

export interface BookingStep {
  step: number;
  instruction: string;
  detail?: string;
}

export interface ParseRequest {
  type: InputMethod;
  input: string;
  platform?: Platform;
}

export interface ParseResponse {
  success: boolean;
  slip?: ParsedSlip;
  error?: string;
}

export interface ConvertRequest {
  slip: ParsedSlip;
  targetPlatforms: Platform[];
}

export interface ConvertResponse {
  success: boolean;
  conversions?: PlatformSlip[];
  error?: string;
}
