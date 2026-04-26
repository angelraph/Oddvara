'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ParsedSlip, PlatformSlip, Platform, InputMethod } from '@/types';

interface SlipStore {
  inputMethod: InputMethod;
  inputValue: string;
  isLoading: boolean;
  isParsing: boolean;
  isConverting: boolean;
  parsedSlip: ParsedSlip | null;
  conversions: PlatformSlip[] | null;
  error: string | null;
  savedSlips: ParsedSlip[];
  ocrProgress: number;

  setInputMethod: (method: InputMethod) => void;
  setInputValue: (value: string) => void;
  setOcrProgress: (progress: number) => void;
  parseSlip: (input: string, method: InputMethod) => Promise<void>;
  restoreFromSharedSlip: (slip: ParsedSlip) => Promise<void>;
  reset: () => void;
  saveCurrentSlip: () => void;
  deleteSavedSlip: (id: string) => void;
}

const TARGET_PLATFORMS: Platform[] = ['bet9ja', 'sportybet', '1xbet', 'betking'];

async function runConversion(slip: ParsedSlip): Promise<PlatformSlip[]> {
  const res = await fetch('/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slip, targetPlatforms: TARGET_PLATFORMS }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error ?? 'Conversion failed');
  return data.conversions;
}

export const useSlipStore = create<SlipStore>()(
  persist(
    (set, get) => ({
      inputMethod: 'text',
      inputValue: '',
      isLoading: false,
      isParsing: false,
      isConverting: false,
      parsedSlip: null,
      conversions: null,
      error: null,
      savedSlips: [],
      ocrProgress: 0,

      setInputMethod: (method) => set({ inputMethod: method, error: null }),
      setInputValue: (value) => set({ inputValue: value }),
      setOcrProgress: (progress) => set({ ocrProgress: progress }),

      parseSlip: async (input, method) => {
        if (!input.trim()) {
          set({ error: 'Please enter a booking code, paste a slip, or upload a screenshot.' });
          return;
        }

        set({ isLoading: true, isParsing: true, error: null, parsedSlip: null, conversions: null });

        try {
          const parseRes = await fetch('/api/parse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: method, input }),
          });
          const parseData = await parseRes.json();

          if (!parseData.success || !parseData.slip) {
            set({ error: parseData.error ?? 'Failed to parse slip.', isLoading: false, isParsing: false });
            return;
          }

          const slip: ParsedSlip = parseData.slip;

          if (slip.selections.length === 0) {
            set({
              error: 'Could not extract any selections. Try pasting the full bet slip text with team names and odds.',
              isLoading: false,
              isParsing: false,
            });
            return;
          }

          set({ parsedSlip: slip, isParsing: false, isConverting: true });

          const conversions = await runConversion(slip);
          set({ conversions, isConverting: false, isLoading: false });
        } catch {
          set({ error: 'Network error. Please check your connection and try again.', isLoading: false, isParsing: false, isConverting: false });
        }
      },

      restoreFromSharedSlip: async (slip) => {
        set({ parsedSlip: slip, isConverting: true, error: null, conversions: null });
        try {
          const conversions = await runConversion(slip);
          set({ conversions, isConverting: false });
        } catch {
          set({ error: 'Could not convert the shared slip.', isConverting: false });
        }
      },

      reset: () =>
        set({
          inputValue: '',
          parsedSlip: null,
          conversions: null,
          error: null,
          isLoading: false,
          isParsing: false,
          isConverting: false,
          ocrProgress: 0,
        }),

      saveCurrentSlip: () => {
        const { parsedSlip, savedSlips } = get();
        if (!parsedSlip) return;
        if (savedSlips.find((s) => s.id === parsedSlip.id)) return;
        set({ savedSlips: [parsedSlip, ...savedSlips].slice(0, 20) });
      },

      deleteSavedSlip: (id) =>
        set((state) => ({ savedSlips: state.savedSlips.filter((s) => s.id !== id) })),
    }),
    {
      name: 'oddvara-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return window.localStorage;
        return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
      }),
      partialize: (state) => ({ savedSlips: state.savedSlips }),
    }
  )
);
