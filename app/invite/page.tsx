import { Suspense } from 'react';

import InviteClient from './_components/InviteClient';

export default function InvitePage() {
  return (
    <Suspense fallback={null}>
      <InviteClient />
    </Suspense>
  );
}
