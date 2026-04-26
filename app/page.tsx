'use client';

import { Suspense } from 'react';
import { Zap, ArrowDown, BookOpen, Layers, Shuffle, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { InputPanel } from '@/components/input/InputPanel';
import { BetSlipCard } from '@/components/slip/BetSlipCard';
import { PlatformOutput } from '@/components/platform/PlatformOutput';
import { OddsTable } from '@/components/compare/OddsTable';
import { ShareButton } from '@/components/share/ShareButton';
import { SlipLoader } from '@/components/share/SlipLoader';
import { BookingCodeGuide } from '@/components/booking/BookingCodeGuide';
import { Spinner } from '@/components/ui';
import { useSlipStore } from '@/store/useSlipStore';

const HOW_IT_WORKS = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Paste your slip',
    desc: 'Enter a booking code, paste your slip text, or upload a screenshot from any platform.',
  },
  {
    icon: <Shuffle className="w-5 h-5" />,
    title: 'Auto-parsed & normalised',
    desc: 'Oddvara extracts teams, markets, odds, and selections — then maps them across platforms.',
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: 'Rebuild on any platform',
    desc: 'Get a step-by-step guide to place the same bet on Bet9ja, SportyBet, 1xBet, or BetKing.',
  },
];

export default function Home() {
  const { parsedSlip, conversions, isLoading, isParsing, isConverting, error } = useSlipStore();
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
        <section className="text-center px-4 pt-16 pb-12">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ov-green/10 border border-ov-green/20 text-ov-green text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-ov-green animate-pulse-dot" />
              Convert any bet slip — instantly
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-ov-text leading-none mb-5">
              Rebuild Your Bet
              <br />
              <span className="text-ov-green">Anywhere.</span>
            </h1>

            <p className="text-ov-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              Paste a booking code or bet slip — Oddvara extracts every selection, maps the markets,
              and rebuilds it for{' '}
              <strong className="text-ov-text">Bet9ja</strong>,{' '}
              <strong className="text-ov-text">SportyBet</strong>,{' '}
              <strong className="text-ov-text">1xBet</strong>, or{' '}
              <strong className="text-ov-text">BetKing</strong>.
            </p>

            {/* Platform Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {[
                { name: 'Bet9ja', color: '#009A44' },
                { name: 'SportyBet', color: '#E63946' },
                { name: '1xBet', color: '#1E90FF' },
                { name: 'BetKing', color: '#FF6B00' },
              ].map((p) => (
                <span
                  key={p.name}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium bg-ov-card"
                  style={{ borderColor: `${p.color}44`, color: p.color }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                </span>
              ))}
            </div>

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

          {/* Booking code detected — show guide instead */}
          {parsedSlip?.isBookingCode && (
            <BookingCodeGuide slip={parsedSlip} />
          )}

          {/* Normal slip: parsed card + share */}
          {parsedSlip && !parsedSlip.isBookingCode && (
            <div className="space-y-3">
              {/* Directional banner */}
              {parsedSlip.sourcePlatform !== 'unknown' && (
                <div className="flex items-center gap-2 text-xs text-ov-muted bg-ov-elevated border border-ov-border rounded-xl px-4 py-2.5">
                  <ArrowRight className="w-3.5 h-3.5 text-ov-green flex-shrink-0" />
                  <span>
                    Converting from{' '}
                    <span className="text-ov-text font-semibold capitalize">{parsedSlip.sourcePlatform}</span>
                    {' '}→ all other platforms
                  </span>
                </div>
              )}
              <BetSlipCard slip={parsedSlip} />
              <div className="flex justify-end">
                <ShareButton slip={parsedSlip} />
              </div>
            </div>
          )}

          {/* Odds Comparison Table */}
          {parsedSlip && !parsedSlip.isBookingCode && conversions && conversions.length > 0 && (
            <OddsTable slip={parsedSlip} conversions={conversions} />
          )}

          {/* Platform guides */}
          {!parsedSlip?.isBookingCode && (conversions || isConverting) && <PlatformOutput />}
        </section>

        {/* ── How It Works ───────────────────────────────── */}
        {!showResults && (
          <section id="how-it-works" className="border-t border-ov-border bg-ov-surface/50">
            <div className="max-w-4xl mx-auto px-4 py-20">
              <p className="text-center text-ov-muted text-sm font-semibold uppercase tracking-widest mb-12">
                How it works
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
