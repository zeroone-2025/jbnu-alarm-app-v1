import { Suspense } from 'react';
import TeamDetailView from '../../_components/team/TeamDetailView';

export default function TeamDetailPage() {
  return (
    <Suspense fallback={null}>
      <TeamDetailView />
    </Suspense>
  );
}
