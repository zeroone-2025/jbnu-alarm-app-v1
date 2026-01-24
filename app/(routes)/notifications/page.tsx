import { Suspense } from 'react';
import NotificationsClient from './_components/NotificationsClient';

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      }
    >
      <NotificationsClient />
    </Suspense>
  );
}
