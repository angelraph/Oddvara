'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { PlatformCard } from './PlatformCard';
import { useSlipStore } from '@/store/useSlipStore';
import { Spinner } from '@/components/ui';
import type { PlatformSlip } from '@/types';

function CodeBlock({ platform }: { platform: PlatformSlip }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!platform.bookingCode) return;
    await navigator.clipboard.writeText(platform.bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasCode = !!platform.bookingCode;

  return (
    <div
      className="flex flex-col gap-2 rounded-xl border p-4 bg-ov-card"
      style={{ borderColor: platform.logoColor + '28' }}
    >
      {/* Platform name */}
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: platform.logoColor }}
        />
        <span className="text-xs font-semibold text-ov-muted uppercase tracking-wider">
          {platform.platformName}
        </span>
        {platform.estimatedTotalOdds && platform.estimatedTotalOdds > 1 && (
          <span className="ml-auto text-xs text-ov-faint font-mono">
            ×{platform.estimatedTotalOdds.toFixed(2)}
          </span>
        )}
      </div>

      {/* Code or CTA */}
      {hasCode ? (
        <div className="flex items-center gap-2">
          <span className="flex-1 font-mono text-lg font-bold tracking-widest text-ov-text truncate">
            {platform.bookingCode}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 flex-shrink-0"
            style={
              copied
                ? { backgroundColor: '#16a34a22', borderColor: '#16a34a60', color: '#4ade80' }
                : { backgroundColor: 'transparent', borderColor: platform.logoColor + '50', color: platform.logoColor }
            }
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      ) : (
        <a
          href={platform.platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: platform.logoColor }}
        >
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          Add selections on {platform.platformName}
        </a>
      )}
    </div>
  );
}

export function PlatformOutput() {
  const { conversions, isConverting, parsedSlip } = useSlipStore();
  const [showDetails, setShowDetails] = useState(false);

  if (isConverting) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Spinner size="lg" />
        <p className="text-ov-muted text-sm">Converting to all platforms...</p>
      </div>
    );
  }

  if (!conversions || conversions.length === 0) return null;

  const sorted = [...conversions].sort((a, b) => b.overallConfidence - a.overallConfidence);
  const hasAnyCodes = sorted.some((p) => p.bookingCode);
  const isBookingCodeInput = parsedSlip?.isBookingCode === false && parsedSlip?.sourcePlatform !== 'unknown';

  return (
    <div className="space-y-5">
      {/* Codes Grid — primary output */}
      <div className="rounded-2xl border border-ov-border bg-ov-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-ov-border flex items-center justify-between">
          <div>
            <h2 className="text-ov-text font-bold text-base">
              {hasAnyCodes ? 'Your Booking Codes' : 'Equivalent Bets'}
            </h2>
            <p className="text-ov-muted text-xs mt-0.5">
              {hasAnyCodes
                ? 'Click Copy next to any code — paste it directly into the bookmaker app'
                : 'Add these selections on each platform to get your booking code'}
            </p>
          </div>
          {isBookingCodeInput && !hasAnyCodes && (
            <span className="text-xs text-ov-amber bg-ov-amber/10 border border-ov-amber/25 px-2.5 py-1 rounded-lg">
              Add CONVERTBET_API_KEY to auto-generate codes
            </span>
          )}
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.map((p) => (
            <CodeBlock key={p.platform} platform={p} />
          ))}
        </div>

        {!hasAnyCodes && (
          <div className="px-5 py-3 border-t border-ov-border bg-ov-elevated/50">
            <p className="text-xs text-ov-faint leading-relaxed">
              {parsedSlip?.isBookingCode
                ? 'To get real codes instantly: add your CONVERTBET_API_KEY environment variable.'
                : 'Booking codes can only be auto-generated from a source booking code input. For pasted slips, use the step-by-step guide below.'}
            </p>
          </div>
        )}
      </div>

      {/* Toggle detailed cards */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-ov-muted hover:text-ov-text transition-colors"
      >
        {showDetails ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            Hide step-by-step guides
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            Show step-by-step guides &amp; mapped selections
          </>
        )}
      </button>

      {/* Detailed platform cards */}
      {showDetails && (
        <div className="grid grid-cols-1 gap-4">
          {sorted.map((platform) => (
            <PlatformCard key={platform.platform} platform={platform} />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-ov-faint leading-relaxed px-4">
        Odds shown are from your original slip. Live odds on each platform may differ — always verify before placing.
      </p>
    </div>
  );
}
