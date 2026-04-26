import type { ParsedSlip } from '@/types';

export function encodeSlipForUrl(slip: ParsedSlip): string {
  try {
    const json = JSON.stringify(slip);
    return btoa(encodeURIComponent(json));
  } catch {
    return '';
  }
}

export function decodeSlipFromUrl(encoded: string): ParsedSlip | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json) as ParsedSlip;
  } catch {
    return null;
  }
}

export function buildShareUrl(slip: ParsedSlip): string {
  const encoded = encodeSlipForUrl(slip);
  if (!encoded || typeof window === 'undefined') return '';
  return `${window.location.origin}/?slip=${encoded}`;
}
