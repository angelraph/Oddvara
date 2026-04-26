import { NextRequest, NextResponse } from 'next/server';
import { convertSlip } from '@/lib/builder';
import { generateBookingCodes } from '@/lib/builder/codeGenerator';
import type { ConvertRequest, ConvertResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: ConvertRequest = await req.json();
    const { slip, targetPlatforms } = body;

    if (!slip || !targetPlatforms?.length) {
      return NextResponse.json<ConvertResponse>(
        { success: false, error: 'Missing slip or target platforms.' },
        { status: 400 }
      );
    }

    const conversions = convertSlip(slip, targetPlatforms);

    // Attempt real booking code generation (requires CONVERTBET_API_KEY env var)
    const codes = await generateBookingCodes(slip, targetPlatforms);

    const conversionsWithCodes = conversions.map((c) => ({
      ...c,
      bookingCode: codes[c.platform] ?? null,
    }));

    return NextResponse.json<ConvertResponse>({ success: true, conversions: conversionsWithCodes });
  } catch (err) {
    console.error('[convert]', err);
    return NextResponse.json<ConvertResponse>(
      { success: false, error: 'Internal conversion error.' },
      { status: 500 }
    );
  }
}
