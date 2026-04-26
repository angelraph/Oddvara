'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSlipStore } from '@/store/useSlipStore';
import { decodeSlipFromUrl } from '@/lib/share';

export function SlipLoader() {
  const searchParams = useSearchParams();
  const restoreFromSharedSlip = useSlipStore((s) => s.restoreFromSharedSlip);
  const parsedSlip = useSlipStore((s) => s.parsedSlip);

  useEffect(() => {
    const encoded = searchParams.get('slip');
    if (encoded && !parsedSlip) {
      const slip = decodeSlipFromUrl(encoded);
      if (slip) restoreFromSharedSlip(slip);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
