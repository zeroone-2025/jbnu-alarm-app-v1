'use client';

import { Suspense } from 'react';

import TeamSettingsClient from './_components/TeamSettingsClient';

export default function TeamSettingsPage() {
  return (
    <Suspense fallback={null}>
      <TeamSettingsClient />
    </Suspense>
  );
}
