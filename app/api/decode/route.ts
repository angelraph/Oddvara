import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import type { BetSelection, Platform } from '@/types';

interface DecodeResult {
  success: boolean;
  selections?: BetSelection[];
  totalOdds?: number;
  error?: string;
}

// SportyBet Nigeria sharecode API
async function decodeSportyBet(code: string): Promise<DecodeResult> {
  try {
    const res = await fetch(
      `https://www.sportybet.com/api/ng/orders/shareCode/${code}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.sportybet.com/ng/',
          'Accept': 'application/json',
        },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };

    const data = await res.json();

    // SportyBet wraps response in { code: 0, data: {...} } or { data: [...] }
    const payload = data?.data ?? data;
    const outcomes: unknown[] = Array.isArray(payload)
      ? payload
      : (payload?.outcomes ?? payload?.events ?? payload?.selections ?? []);

    if (!outcomes.length) return { success: false, error: 'No outcomes in response' };

    const selections: BetSelection[] = outcomes.map((o: unknown) => {
      const ev = o as Record<string, unknown>;
      const home = String(ev.homeTeamName ?? ev.home ?? ev.homeTeam ?? '');
      const away = String(ev.awayTeamName ?? ev.away ?? ev.awayTeam ?? '');
      const market = String(ev.marketName ?? ev.market ?? ev.betTypeName ?? 'Full Time Result');
      const selection = String(ev.outcomeName ?? ev.outcome ?? ev.pick ?? '1');
      const odds = parseFloat(String(ev.odds ?? ev.odd ?? 1));
      const league = String(ev.leagueName ?? ev.league ?? ev.tournament ?? '');

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
    });

    const totalOdds = selections.reduce((acc, s) => acc * (s.odds || 1), 1);

    return { success: true, selections, totalOdds: parseFloat(totalOdds.toFixed(2)) };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

function normalizeMarket(market: string): BetSelection['marketCode'] {
  const m = market.toLowerCase();
  if (m.includes('over') || m.includes('under') || m.includes('total')) return 'OVER_UNDER';
  if (m.includes('both') || m.includes('btts') || m.includes('gg')) return 'BTTS';
  if (m.includes('double') || m.includes('dc')) return 'DOUBLE_CHANCE';
  if (m.includes('half') && m.includes('time')) return 'HALFTIME_RESULT';
  if (m.includes('correct') || m.includes('score')) return 'CORRECT_SCORE';
  if (m.includes('draw no bet') || m.includes('dnb')) return 'DRAW_NO_BET';
  if (m.includes('1x2') || m.includes('full time') || m.includes('match result') || m.includes('result')) return '1X2';
  return '1X2';
}

function normalizeSelection(sel: string): string {
  const s = sel.toLowerCase().trim();
  if (s === '1' || s === 'home' || s === 'home win') return '1';
  if (s === '2' || s === 'away' || s === 'away win') return '2';
  if (s === 'x' || s === 'draw') return 'X';
  if (s === 'yes' || s === 'gg') return 'Yes';
  if (s === 'no' || s === 'ng') return 'No';
  if (s.startsWith('over')) return `Over ${sel.replace(/[^0-9.]/g, '')}`;
  if (s.startsWith('under')) return `Under ${sel.replace(/[^0-9.]/g, '')}`;
  return sel;
}

const DECODERS: Partial<Record<Platform, (code: string) => Promise<DecodeResult>>> = {
  sportybet: decodeSportyBet,
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
