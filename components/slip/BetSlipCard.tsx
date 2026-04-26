'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, TrendingUp, Bookmark, BookmarkCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Badge, Divider } from '@/components/ui';
import { useSlipStore } from '@/store/useSlipStore';
import type { ParsedSlip, BetSelection } from '@/types';

function SelectionRow({ sel, index }: { sel: BetSelection; index: number }) {
  const confColor = sel.confidence >= 80 ? 'text-ov-green' : sel.confidence >= 50 ? 'text-ov-amber' : 'text-ov-red';

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-ov-elevated text-ov-muted text-xs font-bold flex items-center justify-center mt-0.5">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="text-ov-text font-semibold text-sm leading-tight">
              {sel.homeTeamNormalized || sel.homeTeam}
              <span className="text-ov-faint font-normal mx-1.5">vs</span>
              {sel.awayTeamNormalized || sel.awayTeam}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <Badge variant="neutral">{sel.market}</Badge>
              <Badge variant="purple">{sel.selection}</Badge>
              {sel.matchTime && (
                <span className="inline-flex items-center gap-1 text-xs text-ov-muted">
                  <Clock className="w-3 h-3" />
                  {sel.matchTime}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <p className="text-ov-green font-bold tabular-nums">{sel.odds > 0 ? sel.odds.toFixed(2) : '—'}</p>
          <p className={`text-xs mt-0.5 ${confColor}`}>{sel.confidence}%</p>
        </div>
      </div>
    </div>
  );
}

interface BetSlipCardProps {
  slip: ParsedSlip;
}

export function BetSlipCard({ slip }: BetSlipCardProps) {
  const { saveCurrentSlip, savedSlips } = useSlipStore();
  const [expanded, setExpanded] = useState(true);
  const isSaved = savedSlips.some((s) => s.id === slip.id);

  const platformLabel = slip.sourcePlatform !== 'unknown' ? slip.sourcePlatform : null;
  const avgConfidence = slip.selections.length
    ? Math.round(slip.selections.reduce((a, s) => a + s.confidence, 0) / slip.selections.length)
    : 0;

  return (
    <Card className="animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-ov-green/10 border border-ov-green/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-ov-green" />
            </div>
            <div>
              <h2 className="text-ov-text font-bold text-base">Slip Parsed</h2>
              <p className="text-ov-muted text-xs mt-0.5">
                {slip.selections.length} selection{slip.selections.length !== 1 ? 's' : ''} •{' '}
                <span className="capitalize">{slip.betType}</span>
                {platformLabel && (
                  <> • from <span className="capitalize text-ov-text">{platformLabel}</span></>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isSaved && (
              <button
                onClick={saveCurrentSlip}
                className="p-2 rounded-xl text-ov-muted hover:text-ov-amber hover:bg-ov-amber/10 transition-colors"
                title="Save slip"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            )}
            {isSaved && (
              <span className="p-2 text-ov-amber" title="Saved">
                <BookmarkCheck className="w-4 h-4" />
              </span>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-xl text-ov-muted hover:text-ov-text hover:bg-ov-elevated transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 border-t border-ov-border">
        {[
          { label: 'Total Odds', value: slip.totalOdds > 1 ? slip.totalOdds.toFixed(2) : '—' },
          { label: 'Avg Confidence', value: `${avgConfidence}%` },
          { label: 'Bet Type', value: slip.betType.charAt(0).toUpperCase() + slip.betType.slice(1) },
        ].map((stat, i) => (
          <div key={stat.label} className={`px-5 py-3 text-center ${i < 2 ? 'border-r border-ov-border' : ''}`}>
            <p className="text-ov-text font-bold text-lg tabular-nums">{stat.value}</p>
            <p className="text-ov-muted text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Selections */}
      {expanded && (
        <div className="px-5 pt-4 pb-5 space-y-0 border-t border-ov-border divide-y divide-ov-border/50">
          {slip.selections.map((sel, i) => (
            <SelectionRow key={sel.id} sel={sel} index={i} />
          ))}
        </div>
      )}
    </Card>
  );
}
