'use client';

import { Suspense } from 'react';

import TeamDetailClient from './_components/TeamDetailClient';

export default function TeamDetailPage() {
  return (
    <Suspense fallback={null}>
      <TeamDetailClient />
    </Suspense>
  );
}
