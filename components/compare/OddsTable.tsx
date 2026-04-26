'use client';

import { BarChart3, Info } from 'lucide-react';
import { Card } from '@/components/ui';
import type { PlatformSlip, ParsedSlip } from '@/types';

interface OddsTableProps {
  slip: ParsedSlip;
  conversions: PlatformSlip[];
}

export function OddsTable({ slip, conversions }: OddsTableProps) {
  if (slip.selections.length === 0) return null;

  return (
    <Card className="overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-ov-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-ov-cyan/10 border border-ov-cyan/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-ov-cyan" />
          </div>
          <div>
            <h3 className="text-ov-text font-bold text-sm">Odds Comparison</h3>
            <p className="text-ov-muted text-xs">Side-by-side view of all platforms</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-ov-faint bg-ov-elevated border border-ov-border px-2.5 py-1.5 rounded-lg">
          <Info className="w-3 h-3" />
          Live odds may differ
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ov-border bg-ov-elevated/40">
              <th className="text-left px-5 py-3 text-ov-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">
                Match / Market
              </th>
              <th className="text-center px-4 py-3 text-ov-muted font-medium text-xs uppercase tracking-wider whitespace-nowrap">
                Original
              </th>
              {conversions.map((p) => (
                <th
                  key={p.platform}
                  className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap"
                  style={{ color: p.logoColor }}
                >
                  {p.platformName}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-ov-border/40">
            {slip.selections.map((sel, i) => (
              <tr key={sel.id} className="hover:bg-ov-elevated/30 transition-colors">
                {/* Match */}
                <td className="px-5 py-3.5 min-w-[180px]">
                  <p className="text-ov-text font-medium text-sm leading-snug">
                    {sel.homeTeamNormalized}
                    <span className="text-ov-faint mx-1 font-normal text-xs">vs</span>
                    {sel.awayTeamNormalized}
                  </p>
                  <p className="text-ov-muted text-xs mt-0.5 truncate max-w-[200px]">{sel.market}</p>
                </td>

                {/* Original odds */}
                <td className="px-4 py-3.5 text-center">
                  <p className="text-ov-green font-bold tabular-nums text-sm">
                    {sel.odds > 0 ? sel.odds.toFixed(2) : '—'}
                  </p>
                  <p className="text-ov-muted text-xs mt-0.5">{sel.selectionNormalized}</p>
                </td>

                {/* Per-platform */}
                {conversions.map((platform) => {
                  const convSel = platform.selections[i];
                  const odds = convSel?.platformOdds ?? convSel?.original.odds;
                  const conf = convSel?.confidence ?? 0;
                  const textColor = conf >= 80 ? 'text-ov-text' : conf >= 50 ? 'text-ov-amber' : 'text-ov-red';

                  return (
                    <td key={platform.platform} className="px-4 py-3.5 text-center">
                      <p className={`font-bold tabular-nums text-sm ${textColor}`}>
                        {odds && odds > 0 ? odds.toFixed(2) : '—'}
                      </p>
                      <p className="text-ov-muted text-xs mt-0.5 max-w-[80px] mx-auto truncate">
                        {convSel?.platformSelection ?? '—'}
                      </p>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

          {/* Totals */}
          <tfoot>
            <tr className="border-t border-ov-border bg-ov-elevated/50">
              <td className="px-5 py-3 text-ov-muted text-xs font-semibold uppercase tracking-wider">
                Total Odds
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-ov-green font-bold tabular-nums text-sm">
                  {slip.totalOdds > 1 ? slip.totalOdds.toFixed(2) : '—'}
                </span>
              </td>
              {conversions.map((p) => (
                <td key={p.platform} className="px-4 py-3 text-center">
                  <span className="text-ov-text font-bold tabular-nums text-sm">
                    {p.estimatedTotalOdds && p.estimatedTotalOdds > 1
                      ? `~${p.estimatedTotalOdds.toFixed(2)}`
                      : '—'}
                  </span>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
