'use client';

import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, List, Search, Copy, Check } from 'lucide-react';
import { Card, Badge, Divider, ProgressBar } from '@/components/ui';
import type { PlatformSlip } from '@/types';

interface PlatformCardProps {
  platform: PlatformSlip;
}

function CopyButton({ text, color }: { text: string; color: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 flex-shrink-0"
      style={
        copied
          ? { backgroundColor: '#16a34a22', borderColor: '#16a34a60', color: '#4ade80' }
          : { backgroundColor: 'transparent', borderColor: color + '50', color }
      }
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export function PlatformCard({ platform }: PlatformCardProps) {
  const [view, setView] = useState<'guide' | 'selections'>('guide');
  const [expanded, setExpanded] = useState(false);

  const confColorClass =
    platform.overallConfidence >= 80 ? 'bg-ov-green' : platform.overallConfidence >= 50 ? 'bg-ov-amber' : 'bg-ov-red';

  const confBadge: 'green' | 'amber' | 'red' =
    platform.overallConfidence >= 80 ? 'green' : platform.overallConfidence >= 50 ? 'amber' : 'red';

  return (
    <Card className="overflow-hidden">
      <div className="h-0.5 w-full" style={{ backgroundColor: platform.logoColor }} />

      {/* Platform Header */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: platform.logoColor + '18', border: `1px solid ${platform.logoColor}35` }}
            >
              <span style={{ color: platform.logoColor }}>{platform.platformName.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-ov-text font-bold">{platform.platformName}</h3>
              <p className="text-ov-muted text-xs">
                {platform.selections.length} selection{platform.selections.length !== 1 ? 's' : ''} ·{' '}
                {platform.estimatedTotalOdds && platform.estimatedTotalOdds > 1
                  ? `~${platform.estimatedTotalOdds.toFixed(2)} odds`
                  : 'odds vary'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={confBadge}>{platform.overallConfidence}% match</Badge>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-ov-muted hover:text-ov-text hover:bg-ov-elevated transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Booking code inline if available */}
        {platform.bookingCode && (
          <div className="mt-3 flex items-center gap-2">
            <span className="font-mono text-lg font-bold tracking-widest text-ov-text flex-1 truncate">
              {platform.bookingCode}
            </span>
            <CopyButton text={platform.bookingCode} color={platform.logoColor} />
          </div>
        )}
      </div>

      {expanded && (
        <>
          <div className="px-5 pb-4 border-t border-ov-border pt-3">
            <ProgressBar
              value={platform.overallConfidence}
              label="Mapping confidence"
              colorClass={confColorClass}
            />
          </div>

          <div className="px-5 pb-3 flex gap-2">
            <button
              onClick={() => setView('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                view === 'guide'
                  ? 'bg-ov-elevated text-ov-text border border-ov-border'
                  : 'text-ov-muted hover:text-ov-text'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Step-by-step
            </button>
            <button
              onClick={() => setView('selections')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                view === 'selections'
                  ? 'bg-ov-elevated text-ov-text border border-ov-border'
                  : 'text-ov-muted hover:text-ov-text'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Mapped bets
            </button>

            <a
              href={platform.platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-xs text-ov-muted hover:text-ov-text transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open
            </a>
          </div>

          <Divider />

          {view === 'guide' && (
            <div className="px-5 py-4 space-y-4">
              {platform.bookingGuide.map((step, i) => {
                const isLast = i === platform.bookingGuide.length - 1;
                return (
                  <div key={step.step} className="flex gap-3">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                        isLast ? 'text-white' : 'bg-ov-elevated border border-ov-border text-ov-muted'
                      }`}
                      style={isLast ? { backgroundColor: platform.logoColor } : undefined}
                    >
                      {step.step}
                    </div>
                    <div>
                      <p className="text-ov-text text-sm font-medium">{step.instruction}</p>
                      {step.detail && (
                        <p className="text-ov-muted text-xs mt-0.5 leading-relaxed">{step.detail}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === 'selections' && (
            <div className="divide-y divide-ov-border/50">
              {platform.selections.map((sel) => {
                const icon =
                  sel.confidence >= 80 ? (
                    <CheckCircle className="w-4 h-4 text-ov-green flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-ov-amber flex-shrink-0" />
                  );

                return (
                  <div key={sel.original.id} className="px-5 py-3 flex items-start gap-3">
                    {icon}
                    <div className="min-w-0 flex-1">
                      <p className="text-ov-text text-sm font-medium truncate">{sel.searchQuery}</p>
                      <p className="text-ov-muted text-xs mt-0.5">
                        {sel.platformMarket} →{' '}
                        <span className="text-ov-text font-medium">{sel.platformSelection}</span>
                        {sel.platformOdds && sel.platformOdds > 0 && (
                          <span className="ml-2 text-ov-green font-mono">{sel.platformOdds.toFixed(2)}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-ov-muted flex-shrink-0">{sel.confidence}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
