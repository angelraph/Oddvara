import { detectPlatformFromText, detectPlatformFromCode } from './patterns';
import type { Platform } from '@/types';

export interface BookingCodeInfo {
  isBookingCode: true;
  code: string;
  platform: Platform;
  viewUrl: string | null;
}

const CODE_VIEW_URLS: Partial<Record<Platform, (code: string) => string>> = {
  sportybet: (c) => `https://www.sportybet.com/ng/sharecode/${c}`,
  bet9ja: (c) => `https://web.bet9ja.com/Sport#/booking/${c}`,
  '1xbet': (c) => `https://1xbet.ng/en/coupon/${c}`,
  betking: (c) => `https://www.betking.com/booking-code?code=${c}`,
};

export function analyseBookingCode(raw: string): BookingCodeInfo {
  const code = raw.trim().toUpperCase();

  // Pattern-based detection first, text-based fallback
  let platform: Platform = detectPlatformFromCode(code);
  if (platform === 'unknown') {
    platform = detectPlatformFromText(raw) as Platform;
  }

  const urlBuilder = CODE_VIEW_URLS[platform];
  const viewUrl = urlBuilder ? urlBuilder(code) : null;

  return { isBookingCode: true, code, platform, viewUrl };
}
