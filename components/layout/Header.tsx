'use client';

import { Zap, Github } from 'lucide-react';
import { SavedSlipsDrawer } from '@/components/saved/SavedSlips';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-ov-border bg-ov-bg/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-ov-green flex items-center justify-center">
            <Zap className="w-4 h-4 text-ov-bg" fill="currentColor" />
          </div>
          <span className="font-bold text-lg tracking-tight text-ov-text">
            Odd<span className="text-ov-green">vara</span>
          </span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-ov-green/10 text-ov-green border border-ov-green/20 uppercase tracking-wider">
            Beta
          </span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <a
            href="#how-it-works"
            className="hidden sm:block px-3 py-1.5 text-sm text-ov-muted hover:text-ov-text transition-colors rounded-lg hover:bg-ov-elevated"
          >
            How it works
          </a>

          <SavedSlipsDrawer />

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-ov-muted hover:text-ov-text transition-colors rounded-lg hover:bg-ov-elevated"
            aria-label="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}
