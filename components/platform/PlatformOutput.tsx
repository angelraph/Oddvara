'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { PlatformCard } from './PlatformCard';
import { BestOddsBar } from './BestOddsBar';
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
      className="flex flex-col gap-2.5 rounded-xl border p-4 bg-ov-card"
      style={{ borderColor: platform.logoColor + '28' }}
    >
      {/* Platform name + odds */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: platform.logoColor }} />
        <span className="text-xs font-semibold text-ov-muted uppercase tracking-wider flex-1">
          {platform.platformName}
        </span>
        {platform.adjustedTotalOdds && platform.adjustedTotalOdds > 1 && (
          <span className="text-xs font-mono font-semibold" style={{ color: platform.logoColor }}>
            ×{platform.adjustedTotalOdds.toFixed(2)}
          </span>
        )}
      </div>

      {/* Code row */}
      {hasCode ? (
        <div className="flex items-center gap-2">
          <span className="flex-1 font-mono text-xl font-bold tracking-widest text-ov-text truncate">
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
          href={platform.affiliateUrl || platform.platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
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

  const sorted = [...conversions].sort((a, b) => {
    const aO = a.adjustedTotalOdds ?? 0;
    const bO = b.adjustedTotalOdds ?? 0;
    return bO - aO;
  });

  const hasAnyCodes = sorted.some((p) => p.bookingCode);

  return (
    <div className="space-y-5">
      {/* Best Odds Banner */}
      {parsedSlip && !parsedSlip.isBookingCode && (
        <BestOddsBar conversions={sorted} parsedSlip={parsedSlip} />
      )}

      {/* Codes Grid */}
      <div className="rounded-2xl border border-ov-border bg-ov-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-ov-border">
          <h2 className="text-ov-text font-bold text-base">
            {hasAnyCodes ? 'Your Booking Codes' : 'Equivalent Bets'}
          </h2>
          <p className="text-ov-muted text-xs mt-0.5">
            {hasAnyCodes
              ? 'Tap Copy — paste into any bookmaker app to load the slip instantly'
              : 'Open each platform and add these selections to get your booking code'}
          </p>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.map((p) => (
            <CodeBlock key={p.platform} platform={p} />
          ))}
        </div>

        {!hasAnyCodes && parsedSlip?.isBookingCode && (
          <div className="px-5 py-3 border-t border-ov-border bg-ov-elevated/40">
            <p className="text-xs text-ov-faint leading-relaxed">
              To auto-generate codes from a booking code, add your{' '}
              <code className="bg-ov-card px-1 rounded text-ov-muted">CONVERTBET_API_KEY</code>{' '}
              environment variable from convertbetcodes.com.
            </p>
          </div>
        )}
      </div>

      {/* Toggle step-by-step guides */}
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

      {showDetails && (
        <div className="grid grid-cols-1 gap-4">
          {sorted.map((platform) => (
            <PlatformCard key={platform.platform} platform={platform} />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-ov-faint leading-relaxed px-4">
        Odds shown may differ from live platform odds. Always verify before placing your bet.
      </p>
    </div>
  );
}
