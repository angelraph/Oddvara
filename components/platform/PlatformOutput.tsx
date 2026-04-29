'use client';

import { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  Zap,
  Search,
  ListOrdered,
} from 'lucide-react';
import { useSlipStore } from '@/store/useSlipStore';
import { Spinner } from '@/components/ui';
import type { PlatformSlip } from '@/types';

type GuideTab = 'selections' | 'steps';

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

/* ── Platform card ───────────────────────────────────────────── */
function PlatformCard({ platform }: { platform: PlatformSlip }) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<GuideTab>('selections');
  const { logoColor: accent, codeIsReal } = platform;

  return (
    <div
      className="rounded-xl border bg-ov-card overflow-hidden"
      style={{ borderColor: codeIsReal ? accent + '45' : '#f59e0b28' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-1.5">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
        <span className="text-xs font-semibold text-ov-muted uppercase tracking-wider flex-1">
          {platform.platformName}
        </span>

        {codeIsReal ? (
          <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-ov-green/10 text-ov-green font-semibold border border-ov-green/20">
            <Zap className="w-2.5 h-2.5" />
            Live
          </span>
        ) : (
          <span className="text-xs px-1.5 py-0.5 rounded bg-ov-amber/10 text-ov-amber font-semibold border border-ov-amber/20">
            Guide
          </span>
        )}

        {platform.adjustedTotalOdds && platform.adjustedTotalOdds > 1 && (
          <span className="text-xs font-mono text-ov-faint">
            ×{platform.adjustedTotalOdds.toFixed(2)}
          </span>
        )}
      </div>

      {/* ── Code row ── */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <span className="flex-1 font-mono text-xl font-bold tracking-widest text-ov-text truncate">
          {platform.bookingCode}
        </span>
        <CopyBtn text={platform.bookingCode!} color={codeIsReal ? accent : '#f59e0b'} />
      </div>

      {/* ── Guide section (non-real codes only) ── */}
      {!codeIsReal && platform.selections.length > 0 && (
        <>
          <div className="px-4 pb-2.5">
            <p className="text-xs text-ov-amber/70 leading-snug">
              Add these selections on {platform.platformName} → Share betslip → get your real code
            </p>
          </div>

          <div className="border-t border-ov-border/60">
            {/* Expand toggle */}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-ov-muted hover:text-ov-text transition-colors"
            >
              <span>
                {platform.selections.length} selection{platform.selections.length !== 1 ? 's' : ''} · tap for step-by-step guide
              </span>
              {expanded
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />
              }
            </button>

            {expanded && (
              <>
                {/* Tab switcher */}
                <div className="flex border-b border-ov-border/60 bg-ov-elevated/20">
                  <button
                    onClick={() => setTab('selections')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                      tab === 'selections'
                        ? 'text-ov-text border-b-2 border-ov-text'
                        : 'text-ov-muted hover:text-ov-text'
                    }`}
                  >
                    <Search className="w-3 h-3" />
                    Selections
                  </button>
                  <button
                    onClick={() => setTab('steps')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                      tab === 'steps'
                        ? 'text-ov-text border-b-2 border-ov-text'
                        : 'text-ov-muted hover:text-ov-text'
                    }`}
                  >
                    <ListOrdered className="w-3 h-3" />
                    Step-by-step
                  </button>
                </div>

                {/* Selections tab */}
                {tab === 'selections' && (
                  <div className="divide-y divide-ov-border/50">
                    {platform.selections.map((sel) => (
                      <div key={sel.original.id} className="px-4 py-2.5 flex items-start gap-2.5">
                        {sel.confidence >= 80
                          ? <CheckCircle className="w-3.5 h-3.5 text-ov-green flex-shrink-0 mt-0.5" />
                          : <AlertTriangle className="w-3.5 h-3.5 text-ov-amber flex-shrink-0 mt-0.5" />
                        }
                        <div className="min-w-0 flex-1">
                          <p className="text-ov-text text-xs font-medium truncate">{sel.searchQuery}</p>
                          <p className="text-ov-muted text-xs mt-0.5">
                            {sel.platformMarket}
                            {' → '}
                            <span className="text-ov-text font-semibold">{sel.platformSelection}</span>
                            {sel.platformOdds && sel.platformOdds > 0 && (
                              <span className="ml-1.5 text-ov-green font-mono">
                                {sel.platformOdds.toFixed(2)}
                              </span>
                            )}
                          </p>
                        </div>
                        {sel.matchSearchUrl && (
                          <a
                            href={sel.matchSearchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Search for this match"
                            className="flex items-center gap-1 text-xs font-semibold flex-shrink-0 px-2 py-1 rounded-lg border transition-opacity hover:opacity-80"
                            style={{ color: accent, borderColor: accent + '40' }}
                          >
                            Find
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}

                    <div className="px-4 py-2.5 flex items-center justify-between bg-ov-elevated/30">
                      <p className="text-ov-faint text-xs">
                        Add all selections → tap Share / Book to get your code
                      </p>
                      <a
                        href={platform.platformUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold ml-3 flex-shrink-0"
                        style={{ color: accent }}
                      >
                        Open
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Steps tab */}
                {tab === 'steps' && platform.bookingGuide.length > 0 && (
                  <div className="px-4 py-3 space-y-3">
                    {platform.bookingGuide.map((step) => (
                      <div key={step.step} className="flex gap-3">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: accent + '18', color: accent, border: `1px solid ${accent}35` }}
                        >
                          {step.step}
                        </span>
                        <div>
                          <p className="text-ov-text text-xs font-semibold leading-snug">
                            {step.instruction}
                          </p>
                          {step.detail && (
                            <p className="text-ov-muted text-xs mt-0.5 leading-relaxed">
                              {step.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
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

  const withCodes = sorted.filter((p) => p.bookingCode);
  const realCount = withCodes.filter((p) => p.codeIsReal).length;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-ov-border bg-ov-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-ov-border">
          <h2 className="text-ov-text font-bold text-base">Platform Codes</h2>
          <p className="text-ov-muted text-xs mt-0.5">
            {realCount > 0
              ? `${realCount} live code${realCount !== 1 ? 's' : ''} ready to paste · the rest show step-by-step guides`
              : 'Tap any card to expand the guide — add selections on that platform to generate a real code'}
          </p>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {withCodes.map((p) => (
            <PlatformCard key={p.platform} platform={p} />
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-ov-faint leading-relaxed px-4">
        <span className="text-ov-green font-semibold">Live</span> codes are real and ready to paste.{' '}
        <span className="text-ov-amber font-semibold">Guide</span> codes are estimated — always verify odds before placing your bet.
      </p>
    </div>
  );
}
