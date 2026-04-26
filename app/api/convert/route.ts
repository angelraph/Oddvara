import { NextRequest, NextResponse } from 'next/server';
import { convertSlip } from '@/lib/builder';
import type { ConvertRequest, ConvertResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: ConvertRequest = await req.json();
    const { slip, targetPlatforms } = body;

    if (!slip || !targetPlatforms?.length) {
      return NextResponse.json<ConvertResponse>({ success: false, error: 'Missing slip or target platforms.' }, { status: 400 });
    }

    const conversions = convertSlip(slip, targetPlatforms);

    return NextResponse.json<ConvertResponse>({ success: true, conversions });
  } catch (err) {
    console.error('[convert]', err);
    return NextResponse.json<ConvertResponse>({ success: false, error: 'Internal conversion error.' }, { status: 500 });
  }
}
