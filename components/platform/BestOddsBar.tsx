'use client';

import { TrendingUp, ExternalLink } from 'lucide-react';
import type { PlatformSlip, ParsedSlip } from '@/types';

interface Props {
  conversions: PlatformSlip[];
  parsedSlip: ParsedSlip;
}

export function BestOddsBar({ conversions, parsedSlip }: Props) {
  const sourceOdds = parsedSlip.totalOdds;

  // Find the platform with the best adjusted odds
  const best = conversions.reduce<PlatformSlip | null>((acc, cur) => {
    const curOdds = cur.adjustedTotalOdds ?? cur.estimatedTotalOdds ?? 0;
    const accOdds = acc ? (acc.adjustedTotalOdds ?? acc.estimatedTotalOdds ?? 0) : 0;
    return curOdds > accOdds ? cur : acc;
  }, null);

  if (!best) return null;

  const bestOdds = best.adjustedTotalOdds ?? best.estimatedTotalOdds ?? 0;
  const reference = sourceOdds > 1 ? sourceOdds : (bestOdds / 1.04); // use source if available
  const pctGain = reference > 1 ? ((bestOdds / reference - 1) * 100) : 0;

  if (pctGain < 0.5) return null; // don't show if difference is negligible

  // Potential payout example with ₦1,000 stake
  const stake = 1000;
  const sourceReturn = reference > 1 ? Math.round(stake * reference) : null;
  const bestReturn = Math.round(stake * bestOdds);

  return (
    <div
      className="rounded-2xl border px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      style={{ backgroundColor: best.logoColor + '0d', borderColor: best.logoColor + '30' }}
    >
      {/* Left: icon + message */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: best.logoColor + '20' }}
        >
          <TrendingUp className="w-4 h-4" style={{ color: best.logoColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-ov-text font-bold text-sm">
            Best return on{' '}
            <span style={{ color: best.logoColor }}>{best.platformName}</span>
            {' '}(+{pctGain.toFixed(1)}% better odds)
          </p>
          {sourceReturn && (
            <p className="text-ov-muted text-xs mt-0.5">
              ₦1,000 stake: <span className="line-through text-ov-faint">₦{sourceReturn.toLocaleString()}</span>
              {' '}→{' '}
              <span className="font-semibold" style={{ color: best.logoColor }}>
                ₦{bestReturn.toLocaleString()}
              </span>{' '}
              on {best.platformName}
            </p>
          )}
        </div>
      </div>

      {/* Right: CTA */}
      <a
        href={best.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: best.logoColor }}
      >
        Bet on {best.platformName}
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
