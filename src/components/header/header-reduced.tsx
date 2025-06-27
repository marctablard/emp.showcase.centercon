'use client';

import Image from 'next/image';
import { Link } from 'lucide-react';

export function HeaderReduced() {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 pt-4 z-50 max-w-6xl mx-auto">
        <header className="bg-white h-18 shadow-md border rounded-md">
          <div className="flex items-center">
            <Link href="/">
              <Image src="/images/logo.svg" alt="Logo" width="108" height="16" className="min-w-[108px] min-h-[16px]" />
            </Link>
          </div>
        </header>
      </div>
    </>
  );
}
