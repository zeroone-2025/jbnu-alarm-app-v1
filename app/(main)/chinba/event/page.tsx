import { Suspense } from 'react';
import ChinbaDetailClient from './_components/ChinbaDetailClient';

export default function ChinbaEventPage() {
    return (
        <Suspense fallback={null}>
            <ChinbaDetailClient />
        </Suspense>
    );
}
