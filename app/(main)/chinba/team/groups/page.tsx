import { Suspense } from 'react';
import GroupManageView from '../../_components/team/GroupManageView';

export default function GroupsPage() {
  return (
    <Suspense fallback={null}>
      <GroupManageView />
    </Suspense>
  );
}
