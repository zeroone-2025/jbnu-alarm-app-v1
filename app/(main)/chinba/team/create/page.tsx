import { Suspense } from 'react';
import TeamCreateView from '../../_components/team/TeamCreateView';

export default function TeamCreatePage() {
  return (
    <Suspense fallback={null}>
      <TeamCreateView />
    </Suspense>
  );
}
