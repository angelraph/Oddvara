'use client';

import { ArrowRight } from 'lucide-react';
import { useSlipStore } from '@/store/useSlipStore';
import type { Platform } from '@/types';

interface PlatformOption {
  id: Platform;
  name: string;
  color: string;
  multiplier: number;
}

const PLATFORM_OPTIONS: PlatformOption[] = [
  { id: 'bet9ja',    name: 'Bet9ja',    color: '#009A44', multiplier: 1.00 },
  { id: 'sportybet', name: 'SportyBet', color: '#E63946', multiplier: 0.98 },
  { id: '1xbet',     name: '1xBet',     color: '#1E90FF', multiplier: 1.04 },
  { id: 'betking',   name: 'BetKing',   color: '#FF6B00', multiplier: 1.01 },
  { id: 'stake',     name: 'Stake',     color: '#00d32b', multiplier: 1.02 },
];

interface PlatformPickerProps {
  exclude?: Platform;
}

export function PlatformPicker({ exclude }: PlatformPickerProps) {
  const { parsedSlip, convertToTarget } = useSlipStore();
  if (!parsedSlip) return null;

  const source = exclude ?? parsedSlip.sourcePlatform;
  const available = PLATFORM_OPTIONS.filter((p) => p.id !== source);

  const estimateOdds = (multiplier: number): string | null => {
    const base = parsedSlip.totalOdds;
    if (!base || base <= 1) return null;
    return (base * multiplier).toFixed(2);
  };

  return (
    <div className="rounded-2xl border border-ov-border bg-ov-surface overflow-hidden animate-slide-up">
      <div className="px-5 py-4 border-b border-ov-border">
        <h2 className="text-ov-text font-bold text-base">Choose your target platform</h2>
        <p className="text-ov-muted text-xs mt-0.5">
          Where do you want to place this bet?
        </p>
      </div>

      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {available.map((platform) => {
          const odds = estimateOdds(platform.multiplier);
          return (
            <button
              key={platform.id}
              onClick={() => convertToTarget(platform.id)}
              className="flex flex-col gap-3 p-4 rounded-xl border bg-ov-card hover:bg-ov-elevated transition-all text-left group cursor-pointer"
              style={{ borderColor: platform.color + '30' }}
            >
              {/* Platform name */}
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: platform.color }}
                />
                <span className="text-ov-text font-semibold text-sm leading-tight">
                  {platform.name}
                </span>
              </div>

              {/* Estimated odds */}
              {odds ? (
                <p className="text-xs text-ov-muted">
                  Est.{' '}
                  <span className="font-mono font-semibold text-ov-green">×{odds}</span>
                </p>
              ) : (
                <p className="text-xs text-ov-faint">Odds n/a</p>
              )}

              {/* CTA */}
              <div
                className="flex items-center gap-1 text-xs font-semibold mt-auto"
                style={{ color: platform.color }}
              >
                Convert
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
