'use client';

import { TimetableTab } from '@/_components/timetable';

export default function MyTabContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-900">MY</h2>
      </div>

      {/* Timetable */}
      <div className="flex-1 min-h-0">
        <TimetableTab />
      </div>
    </div>
  );
}
