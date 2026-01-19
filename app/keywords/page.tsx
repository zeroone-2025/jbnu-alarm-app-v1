import { Suspense } from 'react';
import KeywordsClient from '@/keywords/keywords-client';

export default function KeywordsPage() {
  return (
    <Suspense fallback={null}>
      <KeywordsClient />
    </Suspense>
  );
}
