'use client';

import { ExternalLink, FileText, ImageIcon } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { useSlipStore } from '@/store/useSlipStore';
import type { ParsedSlip } from '@/types';

const PLATFORM_META: Record<string, { name: string; color: string }> = {
  sportybet: { name: 'SportyBet', color: '#E63946' },
  bet9ja: { name: 'Bet9ja', color: '#009A44' },
  '1xbet': { name: '1xBet', color: '#1E90FF' },
  betking: { name: 'BetKing', color: '#FF6B00' },
  unknown: { name: 'the platform', color: '#7878a0' },
};

const CODE_VIEW_URLS: Partial<Record<string, (c: string) => string>> = {
  sportybet: (c) => `https://www.sportybet.com/ng/sharecode/${c}`,
  bet9ja: (c) => `https://web.bet9ja.com/Sport#/booking/${c}`,
  '1xbet': (c) => `https://1xbet.ng/en/coupon/${c}`,
  betking: (c) => `https://www.betking.com/booking-code?code=${c}`,
};

interface Props {
  slip: ParsedSlip;
}

export function BookingCodeGuide({ slip }: Props) {
  const { setInputMethod, setInputValue, reset } = useSlipStore();
  const meta = PLATFORM_META[slip.sourcePlatform] ?? PLATFORM_META.unknown;

  const viewUrl =
    slip.bookingCode && CODE_VIEW_URLS[slip.sourcePlatform]
      ? CODE_VIEW_URLS[slip.sourcePlatform]!(slip.bookingCode)
      : null;

  const goTo = (method: 'text' | 'screenshot') => {
    reset();
    setInputMethod(method);
    setInputValue('');
  };

  const steps = [
    {
      n: 1,
      title: `Open your slip on ${meta.name}`,
      body: viewUrl
        ? `Click "View on ${meta.name}" below, or enter code ${slip.bookingCode} at ${meta.name}.`
        : `Log in to ${meta.name} and look up booking code ${slip.bookingCode ?? 'your code'}.`,
    },
    {
      n: 2,
      title: 'Copy the full slip text or take a screenshot',
      body: `Long-press the slip details and tap "Select all → Copy", or take a screenshot of the full slip including all match details and odds.`,
    },
    {
      n: 3,
      title: 'Paste or upload it here to convert',
      body: `Use "Paste Slip Text" to paste what you copied, or "Upload Screenshot" to let Oddvara read it automatically.`,
    },
  ];

  return (
    <Card className="animate-slide-up overflow-hidden">
      {/* Coloured top band */}
      <div className="h-1.5 w-full" style={{ backgroundColor: meta.color }} />

      <div className="px-5 py-5 space-y-5">
        {/* Title */}
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-lg"
            style={{ backgroundColor: meta.color + '20', border: `1px solid ${meta.color}40` }}
          >
            <span style={{ color: meta.color }}>#</span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-ov-text font-bold">Booking Code Detected</h2>
              {slip.bookingCode && (
                <Badge variant="neutral" className="font-mono tracking-wider">
                  {slip.bookingCode}
                </Badge>
              )}
              {slip.sourcePlatform !== 'unknown' && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border capitalize"
                  style={{ color: meta.color, borderColor: meta.color + '40', backgroundColor: meta.color + '12' }}
                >
                  {meta.name}
                </span>
              )}
            </div>
            <p className="text-ov-muted text-sm mt-1.5 leading-relaxed">
              Booking codes are private IDs — Oddvara cannot fetch the slip data without calling{' '}
              {meta.name}&apos;s servers directly. Follow these steps to convert it:
            </p>
          </div>
        </div>

        {/* Steps */}
        <ol className="space-y-4">
          {steps.map(({ n, title, body }) => (
            <li key={n} className="flex gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center mt-0.5"
                style={{ borderColor: meta.color + '60', color: meta.color }}
              >
                {n}
              </span>
              <div>
                <p className="text-ov-text text-sm font-semibold">{title}</p>
                <p className="text-ov-muted text-xs mt-0.5 leading-relaxed">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-ov-border">
          {viewUrl && (
            <a href={viewUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                View on {meta.name}
              </Button>
            </a>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => goTo('text')}
            leftIcon={<FileText className="w-3.5 h-3.5" />}
          >
            Paste Slip Text
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => goTo('screenshot')}
            leftIcon={<ImageIcon className="w-3.5 h-3.5" />}
          >
            Upload Screenshot
          </Button>
        </div>
      </div>
    </Card>
  );
}
