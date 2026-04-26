'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, ChevronDown, ChevronUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { useSlipStore } from '@/store/useSlipStore';
import { Spinner } from '@/components/ui';
import type { PlatformSlip } from '@/types';

/* ── Copy button ─────────────────────────────────────────────── */
function CopyBtn({ text, color }: { text: string; color: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex-shrink-0"
      style={
        copied
          ? { background: '#16a34a22', borderColor: '#16a34a60', color: '#4ade80' }
          : { background: 'transparent', borderColor: color + '50', color }
      }
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ── Code card (when real code available) ────────────────────── */
function CodeCard({ platform }: { platform: PlatformSlip }) {
  return (
    <div
      className="flex flex-col gap-2 rounded-xl border p-4 bg-ov-card"
      style={{ borderColor: platform.logoColor + '30' }}
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: platform.logoColor }} />
        <span className="text-xs font-semibold text-ov-muted uppercase tracking-wider flex-1">
          {platform.platformName}
        </span>
        {platform.adjustedTotalOdds && platform.adjustedTotalOdds > 1 && (
          <span className="text-xs font-mono font-semibold text-ov-faint">
            ×{platform.adjustedTotalOdds.toFixed(2)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="flex-1 font-mono text-xl font-bold tracking-widest text-ov-text truncate">
          {platform.bookingCode}
        </span>
        <CopyBtn text={platform.bookingCode!} color={platform.logoColor} />
      </div>
    </div>
  );
}

/* ── Selection row (when no code — show what to bet) ─────────── */
function SelectionCard({ platform }: { platform: PlatformSlip }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl border bg-ov-card overflow-hidden"
      style={{ borderColor: platform.logoColor + '28' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
          style={{ backgroundColor: platform.logoColor + '18', border: `1px solid ${platform.logoColor}35` }}
        >
          <span style={{ color: platform.logoColor }}>{platform.platformName.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-ov-text font-semibold text-sm">{platform.platformName}</p>
          <p className="text-ov-muted text-xs">
            {platform.selections.length} selection{platform.selections.length !== 1 ? 's' : ''}
            {platform.adjustedTotalOdds && platform.adjustedTotalOdds > 1
              ? ` · ×${platform.adjustedTotalOdds.toFixed(2)} odds`
              : ''}
          </p>
        </div>
        <a
          href={platform.platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-opacity hover:opacity-80 flex-shrink-0"
          style={{ borderColor: platform.logoColor + '50', color: platform.logoColor }}
        >
          Open
          <ExternalLink className="w-3 h-3" />
        </a>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-ov-faint hover:text-ov-muted transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Selections list */}
      {expanded && platform.selections.length > 0 && (
        <div className="border-t border-ov-border divide-y divide-ov-border/50">
          {platform.selections.map((sel) => (
            <div key={sel.original.id} className="px-4 py-2.5 flex items-start gap-3">
              {sel.confidence >= 80
                ? <CheckCircle className="w-3.5 h-3.5 text-ov-green flex-shrink-0 mt-0.5" />
                : <AlertTriangle className="w-3.5 h-3.5 text-ov-amber flex-shrink-0 mt-0.5" />
              }
              <div className="min-w-0 flex-1">
                <p className="text-ov-text text-xs font-medium truncate">{sel.searchQuery}</p>
                <p className="text-ov-muted text-xs mt-0.5">
                  {sel.platformMarket} →{' '}
                  <span className="text-ov-text font-semibold">{sel.platformSelection}</span>
                  {sel.platformOdds && sel.platformOdds > 0 && (
                    <span className="ml-1.5 text-ov-green font-mono">{sel.platformOdds.toFixed(2)}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
          <div className="px-4 py-2.5 bg-ov-elevated/40">
            <p className="text-ov-faint text-xs">
              Add these selections to your betslip, then tap Share / Book to get your code.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export function PlatformOutput() {
  const { conversions, isConverting } = useSlipStore();

  if (isConverting) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Spinner size="lg" />
        <p className="text-ov-muted text-sm">Converting to all platforms...</p>
      </div>
    );
  }

  if (!conversions || conversions.length === 0) return null;

  const sorted = [...conversions].sort(
    (a, b) => (b.adjustedTotalOdds ?? 0) - (a.adjustedTotalOdds ?? 0)
  );
  const withCodes  = sorted.filter((p) => p.bookingCode);
  const withoutCodes = sorted.filter((p) => !p.bookingCode);

  return (
    <div className="space-y-5">
      {/* ── Real booking codes (when API key is configured) ── */}
      {withCodes.length > 0 && (
        <div className="rounded-2xl border border-ov-border bg-ov-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-ov-border">
            <h2 className="text-ov-text font-bold text-base">Booking Codes</h2>
            <p className="text-ov-muted text-xs mt-0.5">
              Tap Copy — paste into any bookmaker app to load the slip instantly
            </p>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {withCodes.map((p) => <CodeCard key={p.platform} platform={p} />)}
          </div>
        </div>
      )}

      {/* ── Equivalent selections (tap Open to go to platform) ── */}
      {withoutCodes.length > 0 && (
        <div className="space-y-3">
          {withCodes.length === 0 && (
            <div className="px-1">
              <h2 className="text-ov-text font-bold text-base">Converted Bets</h2>
              <p className="text-ov-muted text-xs mt-0.5">
                Open any platform and add these selections to your betslip
              </p>
            </div>
          )}
          {withoutCodes.map((p) => <SelectionCard key={p.platform} platform={p} />)}
        </div>
      )}

      <p className="text-center text-xs text-ov-faint leading-relaxed px-4">
        Odds shown may differ from live platform odds. Always verify before placing your bet.
      </p>
    </div>
  );
}
