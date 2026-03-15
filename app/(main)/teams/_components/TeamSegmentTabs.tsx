'use client';

export type TeamSegment = 'mannaja' | 'mwoheni' | 'jabahbwa';

interface TeamSegmentTabsProps {
  activeTab: TeamSegment;
  onTabChange: (tab: TeamSegment) => void;
}

const TABS: { key: TeamSegment; label: string }[] = [
  { key: 'mannaja', label: '만나자' },
  { key: 'mwoheni', label: '뭐했니' },
  { key: 'jabahbwa', label: '잡아봐' },
];

export default function TeamSegmentTabs({ activeTab, onTabChange }: TeamSegmentTabsProps) {
  return (
    <div className="flex border-b border-gray-100">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors relative ${
              isActive
                ? 'text-gray-900 font-bold'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-12 rounded-full bg-gray-900" />
            )}
          </button>
        );
      })}
    </div>
  );
}
