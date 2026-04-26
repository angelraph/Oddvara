import { parseSlipText } from './textParser';
import { detectPlatformFromText } from './patterns';
import type { ParsedSlip, InputMethod, Platform } from '@/types';

export interface ParserInput {
  type: InputMethod;
  content: string;
  hintPlatform?: Platform;
}

export function parse(input: ParserInput): ParsedSlip {
  const { type, content } = input;

  // For booking code input: wrap it in a minimal context and parse
  if (type === 'code') {
    const platform = detectPlatformFromText(content) as Platform;
    const wrappedText = `${platform !== 'unknown' ? platform : 'Platform'}\nBooking Code: ${content.trim()}`;
    const slip = parseSlipText(wrappedText);
    slip.bookingCode = content.trim().toUpperCase();
    slip.sourcePlatform = platform;
    return slip;
  }

  // For text/screenshot: parse directly
  return parseSlipText(content);
}

export { parseSlipText };
