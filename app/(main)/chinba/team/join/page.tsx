import { Suspense } from 'react';
import TeamJoinView from '../../_components/team/TeamJoinView';

export default function TeamJoinPage() {
  return (
    <Suspense fallback={null}>
      <TeamJoinView />
    </Suspense>
  );
}
