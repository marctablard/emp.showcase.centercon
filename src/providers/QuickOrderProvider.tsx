'use client';

import { ReactNode } from 'react';
import { QuickOrderDialog } from '@/components/quick-order';

interface QuickOrderProviderProps {
  children: ReactNode;
}

export default function QuickOrderProvider({ children }: QuickOrderProviderProps) {
  return (
    <>
      {children}
      {/* This hidden trigger is for programmatic access to the QuickOrder dialog */}
      <div className="hidden">
        <QuickOrderDialog trigger={<div id="global-quick-order-trigger" />} />
      </div>
    </>
  );
}
