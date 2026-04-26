import { Suspense } from 'react';
import TeamEventCreateView from '../../_components/team/TeamEventCreateView';

export default function EventCreatePage() {
  return (
    <Suspense fallback={null}>
      <TeamEventCreateView />
    </Suspense>
  );
}
