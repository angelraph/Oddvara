'use client';

import { useState } from 'react';
import { Layers, TrendingUp, Copy, Check } from 'lucide-react';
import { PlatformCard } from './PlatformCard';
import { useSlipStore } from '@/store/useSlipStore';
import { Spinner } from '@/components/ui';

function CodePill({ name, code, color }: { name: string; code: string; color: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title={`Copy ${name} code`}
      className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-ov-card hover:bg-ov-elevated transition-colors group"
      style={{ borderColor: color + '30' }}
    >
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs text-ov-muted font-medium">{name}</span>
      <span className="font-mono text-sm font-bold text-ov-text tracking-wider">{code}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-ov-green flex-shrink-0" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-ov-faint group-hover:text-ov-muted flex-shrink-0 transition-colors" />
      )}
    </button>
  );
}

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

  const sorted = [...conversions].sort((a, b) => b.overallConfidence - a.overallConfidence);

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

      {/* All Codes Quick-Copy Strip */}
      <div className="bg-ov-surface border border-ov-border rounded-2xl p-4 space-y-3">
        <p className="text-xs font-semibold text-ov-muted uppercase tracking-wider">
          All Booking Codes — click to copy
        </p>
        <div className="flex flex-wrap gap-2">
          {sorted.map((p) => (
            <CodePill
              key={p.platform}
              name={p.platformName}
              code={p.mockBookingCode}
              color={p.logoColor}
            />
          ))}
        </div>
        <p className="text-xs text-ov-faint">
          These are mock codes. Open each platform and rebuild the slip to get a real booking code.
        </p>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 gap-4">
        {sorted.map((platform) => (
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
