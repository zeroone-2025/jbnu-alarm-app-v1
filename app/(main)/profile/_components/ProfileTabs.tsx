'use client';

import { useRef, useLayoutEffect, useState, useCallback } from 'react';

export type ProfileTabType = 'basic' | 'timetable' | 'career';

interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onTabChange: (tab: ProfileTabType) => void;
}

const TABS: { key: ProfileTabType; label: string }[] = [
  { key: 'basic', label: '기본정보' },
  { key: 'timetable', label: '일정관리' },
  { key: 'career', label: '이력관리' },
];

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const setTabRef = useCallback(
    (key: string) => (el: HTMLButtonElement | null) => {
      if (el) tabRefs.current.set(key, el);
      else tabRefs.current.delete(key);
    },
    [],
  );

  useLayoutEffect(() => {
    const el = tabRefs.current.get(activeTab);
    const container = containerRef.current;
    if (!el || !container) return;
    setIndicator({
      left: el.offsetLeft,
      width: el.offsetWidth,
    });
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className="no-scrollbar relative flex w-full overflow-x-auto border-b border-gray-200"
    >
      {TABS.map((tab) => (
        <button
          key={tab.key}
          ref={setTabRef(tab.key)}
          onClick={() => onTabChange(tab.key)}
          className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === tab.key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {tab.label}
        </button>
      ))}
      <span
        className="absolute bottom-0 h-0.5 bg-gray-900 transition-all duration-300 ease-in-out"
        style={{ left: indicator.left, width: indicator.width }}
      />
    </div>
  );
}
