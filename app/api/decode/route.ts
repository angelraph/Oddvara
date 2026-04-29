import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import type { BetSelection, Platform } from '@/types';

interface DecodeResult {
  success: boolean;
  selections?: BetSelection[];
  totalOdds?: number;
  error?: string;
}

function normalizeMarket(market: string): BetSelection['marketCode'] {
  const m = market.toLowerCase();
  if (m.includes('over') || m.includes('under') || m.includes('total')) return 'OVER_UNDER';
  if (m.includes('both') || m.includes('btts') || m.includes('gg')) return 'BTTS';
  if (m.includes('double') || m.includes('dc')) return 'DOUBLE_CHANCE';
  if (m.includes('half') && m.includes('time')) return 'HALFTIME_RESULT';
  if (m.includes('correct') || m.includes('score')) return 'CORRECT_SCORE';
  if (m.includes('draw no bet') || m.includes('dnb')) return 'DRAW_NO_BET';
  if (m.includes('asian') || m.includes('handicap')) return 'ASIAN_HANDICAP';
  return '1X2';
}

function normalizeSelection(sel: string): string {
  const s = sel.toLowerCase().trim();
  if (s === '1' || s === 'home' || s === 'home win' || s === 'w1') return '1';
  if (s === '2' || s === 'away' || s === 'away win' || s === 'w2') return '2';
  if (s === 'x' || s === 'draw' || s === 'tie') return 'X';
  if (s === 'yes' || s === 'gg') return 'Yes';
  if (s === 'no' || s === 'ng') return 'No';
  if (s.startsWith('over')) return `Over ${sel.replace(/[^0-9.]/g, '')}`;
  if (s.startsWith('under')) return `Under ${sel.replace(/[^0-9.]/g, '')}`;
  return sel;
}

function makeSelection(ev: Record<string, unknown>): BetSelection {
  const home = String(ev.homeTeamName ?? ev.home ?? ev.homeTeam ?? ev.home_team ?? '');
  const away = String(ev.awayTeamName ?? ev.away ?? ev.awayTeam ?? ev.away_team ?? '');
  const market = String(ev.marketName ?? ev.market ?? ev.betTypeName ?? ev.bet_type ?? 'Full Time Result');
  const selection = String(ev.outcomeName ?? ev.outcome ?? ev.pick ?? ev.result ?? '1');
  const odds = parseFloat(String(ev.odds ?? ev.odd ?? ev.coefficient ?? 1));
  const league = String(ev.leagueName ?? ev.league ?? ev.tournament ?? ev.competition ?? '');

  return {
    id: nanoid(8),
    homeTeam: home,
    awayTeam: away,
    homeTeamNormalized: home.toLowerCase().trim(),
    awayTeamNormalized: away.toLowerCase().trim(),
    league,
    market,
    marketCode: normalizeMarket(market),
    selection,
    selectionNormalized: normalizeSelection(selection),
    odds: isNaN(odds) ? 1 : odds,
    confidence: 85,
  };
}

// ── SportyBet ──────────────────────────────────────────────────────────────

async function decodeSportyBet(code: string): Promise<DecodeResult> {
  try {
    const res = await fetch(
      `https://www.sportybet.com/api/ng/orders/shareCode/${code}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: 'https://www.sportybet.com/ng/',
          Accept: 'application/json',
        },
        next: { revalidate: 0 },
      }
    );
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };

    const data = await res.json();
    const payload = data?.data ?? data;
    const outcomes: unknown[] = Array.isArray(payload)
      ? payload
      : (payload?.outcomes ?? payload?.events ?? payload?.selections ?? []);

    if (!outcomes.length) return { success: false, error: 'No outcomes in response' };

    const selections = outcomes.map((o) => makeSelection(o as Record<string, unknown>));
    const totalOdds = selections.reduce((acc, s) => acc * (s.odds || 1), 1);
    return { success: true, selections, totalOdds: parseFloat(totalOdds.toFixed(2)) };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ── Bet9ja ─────────────────────────────────────────────────────────────────

async function decodeBet9ja(code: string): Promise<DecodeResult> {
  const endpoints = [
    `https://web.bet9ja.com/Sport/api/GetBetCode?code=${encodeURIComponent(code)}`,
    `https://web.bet9ja.com/api/booking/${encodeURIComponent(code)}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: 'https://web.bet9ja.com/',
          Accept: 'application/json',
        },
        next: { revalidate: 0 },
      });
      if (!res.ok) continue;

      const data = await res.json();
      const events: unknown[] =
        data?.events ??
        data?.selections ??
        data?.Selections ??
        data?.data?.events ??
        data?.data?.selections ??
        [];

      if (!events.length) continue;

      const selections = events.map((e) => makeSelection(e as Record<string, unknown>));
      const totalOdds = selections.reduce((acc, s) => acc * (s.odds || 1), 1);
      return { success: true, selections, totalOdds: parseFloat(totalOdds.toFixed(2)) };
    } catch {
      continue;
    }
  }

  return { success: false, error: 'Bet9ja decode unavailable' };
}

// ── 1xBet Nigeria ─────────────────────────────────────────────────────────

async function decode1xBet(code: string): Promise<DecodeResult> {
  const endpoints = [
    `https://1xbet.ng/api/v2/coupon/search?coupon=${encodeURIComponent(code)}`,
    `https://1xbet.ng/en/line/coupon?coupon=${encodeURIComponent(code)}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: 'https://1xbet.ng/',
          Accept: 'application/json',
        },
        next: { revalidate: 0 },
      });
      if (!res.ok) continue;

      const data = await res.json();
      const events: unknown[] =
        data?.events ??
        data?.bets ??
        data?.data?.events ??
        data?.coupon?.events ??
        [];

      if (!events.length) continue;

      const selections = events.map((e) => makeSelection(e as Record<string, unknown>));
      const totalOdds = selections.reduce((acc, s) => acc * (s.odds || 1), 1);
      return { success: true, selections, totalOdds: parseFloat(totalOdds.toFixed(2)) };
    } catch {
      continue;
    }
  }

  return { success: false, error: '1xBet decode unavailable' };
}

// ── BetKing ────────────────────────────────────────────────────────────────

async function decodeBetKing(code: string): Promise<DecodeResult> {
  const endpoints = [
    `https://www.betking.com/api/public/booking-code/${encodeURIComponent(code)}`,
    `https://api.betking.com/sports/v1/booking-code?code=${encodeURIComponent(code)}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: 'https://www.betking.com/',
          Accept: 'application/json',
        },
        next: { revalidate: 0 },
      });
      if (!res.ok) continue;

      const data = await res.json();
      const events: unknown[] =
        data?.events ??
        data?.selections ??
        data?.data?.events ??
        data?.betSlip?.events ??
        [];

      if (!events.length) continue;

      const selections = events.map((e) => makeSelection(e as Record<string, unknown>));
      const totalOdds = selections.reduce((acc, s) => acc * (s.odds || 1), 1);
      return { success: true, selections, totalOdds: parseFloat(totalOdds.toFixed(2)) };
    } catch {
      continue;
    }
  }

  return { success: false, error: 'BetKing decode unavailable' };
}

// ── Stake.com ─────────────────────────────────────────────────────────────

async function decodeStake(raw: string): Promise<DecodeResult> {
  // Extract the bet ID whether we received a full URL or just the ID
  let betId = raw.trim();
  const urlMatch = raw.match(/betId=([A-Za-z0-9_-]+)/i) ?? raw.match(/shares\/([A-Za-z0-9_-]+)/i);
  if (urlMatch) betId = urlMatch[1];

  const endpoints = [
    `https://stake.com/sports/shares/${encodeURIComponent(betId)}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: 'https://stake.com/',
          Accept: 'application/json',
          'x-requested-with': 'XMLHttpRequest',
        },
        next: { revalidate: 0 },
      });
      if (!res.ok) continue;

      const data = await res.json();
      const events: unknown[] =
        data?.bets ??
        data?.outcomes ??
        data?.selections ??
        data?.data?.bets ??
        [];

      if (!events.length) continue;

      const selections = events.map((e) => makeSelection(e as Record<string, unknown>));
      const totalOdds = selections.reduce((acc, s) => acc * (s.odds || 1), 1);
      return { success: true, selections, totalOdds: parseFloat(totalOdds.toFixed(2)) };
    } catch {
      continue;
    }
  }

  return { success: false, error: 'Stake decode unavailable' };
}

// ── Router ─────────────────────────────────────────────────────────────────

const DECODERS: Partial<Record<Platform, (code: string) => Promise<DecodeResult>>> = {
  sportybet: decodeSportyBet,
  bet9ja:    decodeBet9ja,
  '1xbet':   decode1xBet,
  betking:   decodeBetKing,
  stake:     decodeStake,
};

export async function POST(req: NextRequest) {
  try {
    const { platform, code }: { platform: Platform; code: string } = await req.json();

    const decoder = DECODERS[platform];
    if (!decoder) {
      return NextResponse.json<DecodeResult>({ success: false, error: 'No decoder for this platform' });
    }

    const result = await decoder(code);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[decode]', err);
    return NextResponse.json<DecodeResult>({ success: false, error: 'Decode failed' });
  }
}
