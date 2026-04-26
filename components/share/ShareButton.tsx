'use client';

import { useState } from 'react';
import { Share2, Check, Link } from 'lucide-react';
import { Button } from '@/components/ui';
import { buildShareUrl } from '@/lib/share';
import type { ParsedSlip } from '@/types';

export function ShareButton({ slip }: { slip: ParsedSlip }) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleShare = async () => {
    const url = buildShareUrl(slip);
    if (!url) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const el = document.createElement('textarea');
        el.value = url;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setState('copied');
      setTimeout(() => setState('idle'), 2500);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleShare}
      leftIcon={
        state === 'copied' ? (
          <Check className="w-3.5 h-3.5 text-ov-green" />
        ) : (
          <Share2 className="w-3.5 h-3.5" />
        )
      }
    >
      {state === 'copied' ? 'Link copied!' : state === 'error' ? 'Copy failed' : 'Share'}
    </Button>
  );
}
