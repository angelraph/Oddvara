'use client';

import { Suspense } from 'react';
import { Zap, ArrowDown, BookOpen, Layers, Shuffle, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { InputPanel } from '@/components/input/InputPanel';
import { BetSlipCard } from '@/components/slip/BetSlipCard';
import { PlatformOutput } from '@/components/platform/PlatformOutput';
import { PlatformPicker } from '@/components/platform/PlatformPicker';
import { OddsTable } from '@/components/compare/OddsTable';
import { ShareButton } from '@/components/share/ShareButton';
import { SlipLoader } from '@/components/share/SlipLoader';
import { Spinner } from '@/components/ui';
import { useSlipStore } from '@/store/useSlipStore';

const HOW_IT_WORKS = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Enter your bet',
    desc: 'Paste a booking code from any platform, type your slip text, or upload a screenshot — Oddvara handles all formats.',
  },
  {
    icon: <Shuffle className="w-5 h-5" />,
    title: 'Decoded & normalised',
    desc: 'Teams, markets, odds and selections are extracted and mapped to equivalent bets on each platform.',
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: 'Get codes for every platform',
    desc: 'Copy a live booking code directly, or follow the step-by-step guide to place the same bet anywhere.',
  },
];

const ALL_PLATFORMS = ['bet9ja', 'sportybet', '1xbet', 'betking', 'stake'] as const;
const PLATFORM_COLORS: Record<string, string> = {
  bet9ja: '#009A44', sportybet: '#E63946', '1xbet': '#1E90FF', betking: '#FF6B00', stake: '#00d32b',
};
const PLATFORM_NAMES: Record<string, string> = {
  bet9ja: 'Bet9ja', sportybet: 'SportyBet', '1xbet': '1xBet', betking: 'BetKing', stake: 'Stake',
};

export default function Home() {
  const { parsedSlip, conversions, selectedPlatform, isLoading, isParsing, isConverting, error, convertToTarget } = useSlipStore();
  const showResults = parsedSlip || isLoading;

  return (
    <div className="min-h-screen bg-ov-bg">
      <Header />

      {/* URL-param slip loader — must be inside Suspense for useSearchParams */}
      <Suspense fallback={null}>
        <SlipLoader />
      </Suspense>

      {/* Background layers */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" />

      <main className="relative pt-14">
        {/* ── Hero ──────────────────────────────────────── */}
        <section className="text-center px-4 pt-14 pb-10">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ov-green/10 border border-ov-green/20 text-ov-green text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-ov-green animate-pulse-dot" />
              Bet9ja · SportyBet · 1xBet · BetKing · Stake
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-ov-text leading-tight mb-4">
              Convert any bet slip
              <br />
              <span className="text-ov-green">across every platform.</span>
            </h1>

            <p className="text-ov-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8">
              Enter a booking code or paste your slip — Oddvara decodes every selection and outputs
              ready-to-use codes for{' '}
              <strong className="text-ov-text">Bet9ja</strong>,{' '}
              <strong className="text-ov-text">SportyBet</strong>,{' '}
              <strong className="text-ov-text">1xBet</strong>,{' '}
              <strong className="text-ov-text">BetKing</strong> &amp;{' '}
              <strong className="text-ov-text">Stake</strong>,
              with a step-by-step guide for each.
            </p>

            {/* Output preview pills */}
            {!showResults && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {[
                  { label: 'Bet9ja',    code: 'B9J·XXXX',       color: '#009A44' },
                  { label: 'SportyBet', code: 'SB·XXXXXX',      color: '#E63946' },
                  { label: '1xBet',     code: '1XNG·XXXX·XXXX', color: '#1E90FF' },
                  { label: 'BetKing',   code: 'BK·XXXXXX',      color: '#FF6B00' },
                  { label: 'Stake',     code: 'Share·Link',      color: '#00d32b' },
                ].map((p) => (
                  <span
                    key={p.label}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium bg-ov-card"
                    style={{ borderColor: `${p.color}35`, color: p.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.label}: <span className="font-mono opacity-60">{p.code}</span>
                  </span>
                ))}
              </div>
            )}

            {!showResults && (
              <ArrowDown className="w-5 h-5 text-ov-faint mx-auto animate-bounce" />
            )}
          </div>
        </section>

        {/* ── Input + Results ────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 pb-16 space-y-8">
          <InputPanel />

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-ov-red/10 border border-ov-red/25 rounded-2xl px-5 py-4 animate-fade-in">
              <span className="text-ov-red mt-0.5 flex-shrink-0">⚠</span>
              <p className="text-ov-red text-sm leading-relaxed">{error}</p>
            </div>
          )}

          {/* Parsing spinner */}
          {isLoading && !parsedSlip && (
            <div className="flex flex-col items-center gap-4 py-12 animate-fade-in">
              <Spinner size="lg" />
              <p className="text-ov-muted text-sm">
                {isParsing ? 'Parsing your slip...' : 'Parsing complete, converting...'}
              </p>
            </div>
          )}

          {/* Directional banner */}
          {parsedSlip && parsedSlip.sourcePlatform !== 'unknown' && (
            <div className="flex items-center gap-2 text-xs text-ov-muted bg-ov-elevated border border-ov-border rounded-xl px-4 py-2.5 animate-fade-in">
              <ArrowRight className="w-3.5 h-3.5 text-ov-green flex-shrink-0" />
              <span>
                {conversions && selectedPlatform ? (
                  <>
                    Converted from{' '}
                    <span className="text-ov-text font-semibold capitalize">{parsedSlip.sourcePlatform}</span>
                    {' → '}
                    <span className="text-ov-green font-semibold">{PLATFORM_NAMES[selectedPlatform] ?? selectedPlatform}</span>
                  </>
                ) : (
                  <>
                    Decoded from{' '}
                    <span className="text-ov-text font-semibold capitalize">{parsedSlip.sourcePlatform}</span>
                    {' — pick your target platform below'}
                  </>
                )}
              </span>
            </div>
          )}

          {/* Parsed slip card + share — only for slips with real selections */}
          {parsedSlip && !parsedSlip.isBookingCode && parsedSlip.selections.length > 0 && (
            <div className="space-y-3">
              <BetSlipCard slip={parsedSlip} />
              <div className="flex justify-end">
                <ShareButton slip={parsedSlip} />
              </div>
            </div>
          )}

          {/* Platform picker — shown after parse, before conversion */}
          {parsedSlip && !conversions && !isConverting && (
            <PlatformPicker />
          )}

          {/* Converting spinner */}
          {isConverting && (
            <div className="flex flex-col items-center gap-4 py-10 animate-fade-in">
              <Spinner size="lg" />
              <p className="text-ov-muted text-sm">Converting...</p>
            </div>
          )}

          {/* Odds Comparison Table */}
          {parsedSlip && !parsedSlip.isBookingCode && conversions && conversions.length > 0 && (
            <OddsTable slip={parsedSlip} conversions={conversions} />
          )}

          {/* Platform output */}
          {conversions && !isConverting && <PlatformOutput />}

          {/* Try another platform row */}
          {conversions && !isConverting && parsedSlip && (
            <div className="rounded-2xl border border-ov-border bg-ov-surface p-4">
              <p className="text-xs text-ov-muted font-semibold mb-3">Try another platform</p>
              <div className="flex flex-wrap gap-2">
                {ALL_PLATFORMS
                  .filter((p) => p !== parsedSlip.sourcePlatform && p !== selectedPlatform)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => convertToTarget(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:opacity-80"
                      style={{ borderColor: PLATFORM_COLORS[p] + '40', color: PLATFORM_COLORS[p] }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[p] }} />
                      {PLATFORM_NAMES[p]}
                    </button>
                  ))
                }
              </div>
            </div>
          )}
        </section>

        {/* ── How It Works ───────────────────────────────── */}
        {!showResults && (
          <section id="how-it-works" className="border-t border-ov-border bg-ov-surface/50">
            <div className="max-w-4xl mx-auto px-4 py-20">
              <p className="text-center text-ov-muted text-sm font-semibold uppercase tracking-widest mb-3">
                How it works
              </p>
              <p className="text-center text-ov-faint text-xs mb-12 max-w-sm mx-auto">
                Three steps from any platform to every platform
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {HOW_IT_WORKS.map((item, i) => (
                  <div key={item.title} className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-ov-card border border-ov-border flex items-center justify-center text-ov-green">
                      {item.icon}
                    </div>
                    <div className="text-xs font-semibold text-ov-faint uppercase tracking-widest">
                      Step {i + 1}
                    </div>
                    <h3 className="text-ov-text font-bold">{item.title}</h3>
                    <p className="text-ov-muted text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="border-t border-ov-border">
          <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-ov-green flex items-center justify-center">
                <Zap className="w-3 h-3 text-ov-bg" fill="currentColor" />
              </div>
              <span className="text-sm font-bold text-ov-text">
                Odd<span className="text-ov-green">vara</span>
              </span>
            </div>
            <p className="text-xs text-ov-faint text-center">
              For informational use only. Always verify odds before placing bets. Gamble responsibly.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
