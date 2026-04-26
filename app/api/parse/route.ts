import { NextRequest, NextResponse } from 'next/server';
import { parse } from '@/lib/parser';
import type { ParseRequest, ParseResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: ParseRequest = await req.json();
    const { type, input } = body;

    if (!input || input.trim().length < 3) {
      return NextResponse.json<ParseResponse>({ success: false, error: 'Input too short.' }, { status: 400 });
    }

    const slip = parse({ type, content: input });

    return NextResponse.json<ParseResponse>({ success: true, slip });
  } catch (err) {
    console.error('[parse]', err);
    return NextResponse.json<ParseResponse>({ success: false, error: 'Internal parse error.' }, { status: 500 });
  }
}
