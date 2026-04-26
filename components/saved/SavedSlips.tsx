'use client';

import { useState } from 'react';
import { Bookmark, X, RotateCcw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui';
import { useSlipStore } from '@/store/useSlipStore';
import type { ParsedSlip } from '@/types';

export function SavedSlipsDrawer() {
  const [open, setOpen] = useState(false);
  const { savedSlips, deleteSavedSlip, restoreFromSharedSlip } = useSlipStore();

  const restore = (slip: ParsedSlip) => {
    restoreFromSharedSlip(slip);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-ov-muted hover:text-ov-text hover:bg-ov-elevated transition-colors text-sm"
        aria-label="Saved slips"
      >
        <Bookmark className="w-4 h-4" />
        <span className="hidden sm:inline">Saved</span>
        {savedSlips.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-ov-green text-ov-bg text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {Math.min(savedSlips.length, 9)}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="flex-1 bg-ov-bg/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="w-full max-w-sm bg-ov-surface border-l border-ov-border flex flex-col shadow-2xl animate-slide-up">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ov-border flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-ov-amber" />
                <h2 className="text-ov-text font-bold text-sm">Saved Slips</h2>
                <Badge variant="neutral">{savedSlips.length}</Badge>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-ov-muted hover:text-ov-text hover:bg-ov-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slip list */}
            <div className="flex-1 overflow-y-auto">
              {savedSlips.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 px-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-ov-elevated border border-ov-border flex items-center justify-center">
                    <Bookmark className="w-5 h-5 text-ov-faint" />
                  </div>
                  <p className="text-ov-muted text-sm font-medium">No saved slips yet</p>
                  <p className="text-ov-faint text-xs leading-relaxed">
                    Parse a bet slip and click the bookmark icon to save it here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-ov-border/50">
                  {savedSlips.map((slip) => {
                    const preview = slip.selections
                      .slice(0, 2)
                      .map((s) => `${s.homeTeamNormalized} vs ${s.awayTeamNormalized}`)
                      .join(' · ');

                    return (
                      <div
                        key={slip.id}
                        className="px-5 py-4 group hover:bg-ov-elevated/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Slip info — clickable */}
                          <button
                            onClick={() => restore(slip)}
                            className="flex-1 text-left min-w-0"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-ov-text text-sm font-semibold capitalize">
                                {slip.betType}
                              </span>
                              <Badge variant="neutral">
                                {slip.selections.length} sel.
                              </Badge>
                              {slip.sourcePlatform !== 'unknown' && (
                                <Badge variant="purple" className="capitalize">
                                  {slip.sourcePlatform}
                                </Badge>
                              )}
                            </div>
                            <p className="text-ov-muted text-xs truncate leading-relaxed">
                              {preview}
                              {slip.selections.length > 2 && ` +${slip.selections.length - 2} more`}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-ov-green text-xs font-mono font-bold">
                                {slip.totalOdds > 1 ? `${slip.totalOdds.toFixed(2)}x` : '—'}
                              </span>
                              <span className="text-ov-faint text-xs">
                                {new Date(slip.parsedAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </button>

                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => restore(slip)}
                              className="p-1.5 rounded-lg text-ov-muted hover:text-ov-green hover:bg-ov-green/10 transition-colors"
                              title="Restore"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteSavedSlip(slip.id)}
                              className="p-1.5 rounded-lg text-ov-muted hover:text-ov-red hover:bg-ov-red/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {savedSlips.length > 0 && (
              <div className="px-5 py-3 border-t border-ov-border flex-shrink-0">
                <p className="text-ov-faint text-xs text-center">
                  Slips are saved to your browser. Up to 20 stored.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
