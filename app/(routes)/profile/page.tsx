import { Suspense } from 'react';
import ProfileClient from './_components/ProfileClient';

export default function ProfilePage() {
    return (
        <Suspense fallback={null}>
            <ProfileClient />
        </Suspense>
    );
}
