import { Suspense } from 'react';
import ChinbaHistoryClient from './_components/ChinbaHistoryClient';

export default function ChinbaPage() {
    return (
        <Suspense fallback={null}>
            <ChinbaHistoryClient />
        </Suspense>
    );
}
