'use client';

import { Layers, TrendingUp } from 'lucide-react';
import { PlatformCard } from './PlatformCard';
import { useSlipStore } from '@/store/useSlipStore';
import { Spinner } from '@/components/ui';

export function PlatformOutput() {
  const { conversions, isConverting, parsedSlip } = useSlipStore();

  if (isConverting) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Spinner size="lg" />
        <p className="text-ov-muted text-sm">Converting to all platforms...</p>
      </div>
    );
  }

  if (!conversions || conversions.length === 0) return null;

  const bestPlatform = conversions.reduce((a, b) =>
    a.overallConfidence >= b.overallConfidence ? a : b
  );

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-ov-purple/10 border border-ov-purple/20 flex items-center justify-center">
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-ov-text font-bold text-base">Platform Conversions</h2>
            <p className="text-ov-muted text-xs">
              Best match: {bestPlatform.platformName} ({bestPlatform.overallConfidence}%)
              {parsedSlip?.sourcePlatform && parsedSlip.sourcePlatform !== 'unknown' && (
                <> · <span className="capitalize">{parsedSlip.sourcePlatform}</span> excluded</>
              )}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-ov-muted bg-ov-elevated border border-ov-border px-3 py-1.5 rounded-lg">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Live odds may vary</span>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 gap-4">
        {conversions
          .sort((a, b) => b.overallConfidence - a.overallConfidence)
          .map((platform) => (
            <PlatformCard key={platform.platform} platform={platform} />
          ))}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-ov-faint leading-relaxed px-4">
        Oddvara rebuilds bets from structured slip data. Odds shown are from your original slip — live odds on each
        platform may differ. Always verify before placing your bet.
      </p>
    </div>
  );
}
