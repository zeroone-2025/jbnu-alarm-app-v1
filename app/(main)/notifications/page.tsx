import { Suspense } from 'react';
import NotificationsClient from './_components/NotificationsClient';

export default function NotificationsPage() {
  return (
    <Suspense fallback={null}>
      <NotificationsClient />
    </Suspense>
  );
}
