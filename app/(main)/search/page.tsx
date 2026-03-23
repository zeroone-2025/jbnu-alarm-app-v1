'use client';

import { Suspense } from 'react';

import SearchContent from './_components/SearchContent';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
