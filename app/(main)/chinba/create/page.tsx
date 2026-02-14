import { Suspense } from 'react';
import ChinbaCreateClient from './_components/ChinbaCreateClient';

export default function ChinbaCreatePage() {
  return (
    <Suspense fallback={null}>
      <ChinbaCreateClient />
    </Suspense>
  );
}
