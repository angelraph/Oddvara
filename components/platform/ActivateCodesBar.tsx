'use client';

import { Zap, ExternalLink } from 'lucide-react';

export function ActivateCodesBar() {
  return (
    <div className="rounded-2xl border border-ov-green/20 bg-ov-green/5 px-5 py-4 space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-ov-green flex-shrink-0" fill="currentColor" />
        <p className="text-ov-text font-bold text-sm">Enable real booking codes</p>
      </div>

      <p className="text-ov-muted text-xs leading-relaxed">
        Your slip was decoded successfully. To get real booking codes for each platform automatically,
        connect a free API key from{' '}
        <a
          href="https://convertbetcodes.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ov-green underline underline-offset-2 inline-flex items-center gap-0.5"
        >
          convertbetcodes.com
          <ExternalLink className="w-3 h-3" />
        </a>
        .
      </p>

      <ol className="space-y-1.5">
        {[
          { n: 1, text: 'Sign up free at convertbetcodes.com and copy your API key' },
          { n: 2, text: 'Create a .env.local file in the project root and add: CONVERTBET_API_KEY=your_key' },
          { n: 3, text: 'Restart the app — real codes will appear automatically for every conversion' },
        ].map(({ n, text }) => (
          <li key={n} className="flex items-start gap-2.5 text-xs text-ov-muted">
            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-ov-green/15 text-ov-green font-bold flex items-center justify-center text-[10px]">
              {n}
            </span>
            <span className="leading-relaxed">{text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
