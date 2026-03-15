import { Suspense } from 'react';
import TeamSettingsView from '../../_components/team/TeamSettingsView';

export default function TeamSettingsPage() {
  return (
    <Suspense fallback={null}>
      <TeamSettingsView />
    </Suspense>
  );
}
