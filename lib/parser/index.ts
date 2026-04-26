import { nanoid } from 'nanoid';
import { parseSlipText } from './textParser';
import { analyseBookingCode } from './platformParser';
import type { ParsedSlip, InputMethod, Platform } from '@/types';

export interface ParserInput {
  type: InputMethod;
  content: string;
  hintPlatform?: Platform;
}

export function parse(input: ParserInput): ParsedSlip {
  const { type, content } = input;

  if (type === 'code') {
    // Booking codes cannot be resolved into match data — return a flag-only slip
    const info = analyseBookingCode(content);
    return {
      id: nanoid(12),
      sourcePlatform: info.platform,
      bookingCode: info.code,
      isBookingCode: true,
      betType: 'single',
      selections: [],
      totalOdds: 0,
      rawInput: content,
      parsedAt: new Date().toISOString(),
    };
  }

  return parseSlipText(content);
}

export { parseSlipText };
