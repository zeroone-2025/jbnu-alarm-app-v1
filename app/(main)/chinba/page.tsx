import { Suspense } from 'react';
import ChinbaTimetableView from './_components/ChinbaTimetableView';

export default function ChinbaPage() {
    return (
        <Suspense fallback={null}>
            <ChinbaTimetableView />
        </Suspense>
    );
}
