'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Loader2 } from 'lucide-react';
import { AddressInput } from '@/lib/validations';

interface AddressMapPickerProps {
  initialAddress?: Partial<AddressInput>;
  onConfirmAddress: (address: AddressInput) => void;
  savedAddresses?: AddressInput[];
}

const DynamicMap = dynamic(() => import('./AddressMapPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-ivory-100 rounded-3xl border border-ivory-300 flex flex-col items-center justify-center gap-3 text-botanical-700">
      <Loader2 className="w-8 h-8 animate-spin text-botanical-500" />
      <span className="text-sm font-semibold">Loading interactive collection map...</span>
    </div>
  ),
});

export default function AddressMapPickerWrapper(props: AddressMapPickerProps) {
  return <DynamicMap {...props} />;
}
