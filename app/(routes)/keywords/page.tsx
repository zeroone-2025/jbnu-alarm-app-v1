import { Suspense } from 'react';
import KeywordsClient from './_components/KeywordsClient';

export default function KeywordsPage() {
  return (
    <Suspense fallback={null}>
      <KeywordsClient />
    </Suspense>
  );
}
