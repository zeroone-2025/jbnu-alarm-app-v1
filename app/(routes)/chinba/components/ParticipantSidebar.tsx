'use client';

import { useState } from 'react';
import type { Participant } from '../types';

interface ParticipantSidebarProps {
  participants: Participant[];
  currentParticipantName: string | null;
  onLogout: () => void;
  onLeave: () => void;
  onHoverParticipant?: (name: string | null) => void;
}

export default function ParticipantSidebar({
  participants,
  currentParticipantName,
  onLogout,
  onLeave,
  onHoverParticipant,
}: ParticipantSidebarProps) {
  const [showMenu, setShowMenu] = useState(false);

  // 샘플 모임 데이터
  const sampleGroups = [
    {
      id: 1,
      name: '알고리즘 스터디',
      members: ['김민수', '이서연', '박지훈'],
      isActive: true,
    },
    {
      id: 2,
      name: '프로젝트 회의',
      members: ['최유진', '정민호'],
      isActive: false,
    },
    {
      id: 3,
      name: '점심 약속',
      members: ['강서윤', '임재현', '윤하은'],
      isActive: false,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* 현재 사용자 정보 */}
        <div className="relative">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                  {currentParticipantName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{currentParticipantName}</p>
                  <p className="text-xs text-gray-500">나</p>
                </div>
              </div>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>
            </div>
          </div>

          {/* 드롭다운 메뉴 */}
          {showMenu && (
            <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-lg border border-gray-200 shadow-xl z-10 overflow-hidden">
              <button
                onClick={() => {
                  onLogout();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                로그아웃
              </button>
              <button
                onClick={() => {
                  if (confirm('정말 방을 나가시겠습니까?')) {
                    onLeave();
                  }
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-gray-50 transition-colors"
              >
                방 나가기
              </button>
            </div>
          )}
        </div>

        {/* 여러 모임 */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            모임 목록
          </h2>
          <div className="space-y-2">
            {sampleGroups.map((group) => (
              <div
                key={group.id}
                className={`p-3 rounded-xl transition-all cursor-pointer border ${
                  group.isActive
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-medium ${group.isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                    {group.name}
                  </p>
                  {group.isActive && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      현재
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-400"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <p className="text-xs text-gray-500">{group.members.length}명 참여</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 참여 멤버 (현재 모임) */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            참여 멤버 ({participants.length}명)
          </h2>
          <div className="space-y-2">
            {participants.map((member) => (
              <div
                key={member.participant_id}
                onMouseEnter={() => onHoverParticipant?.(member.name)}
                onMouseLeave={() => onHoverParticipant?.(null)}
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer bg-gray-50 border border-transparent hover:bg-gray-100 hover:border-blue-200"
              >
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-lg text-gray-700">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">
                    {member.name === currentParticipantName ? '나' : '참가자'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
