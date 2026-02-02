'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateTimeSlots } from './lib/utils';

export default function ChinbaEntryPage() {
  const router = useRouter();
  const [eventCode, setEventCode] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleJoinEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventCode.trim()) {
      router.push(`/chinba/${eventCode.trim()}`);
    }
  };

  // 샘플 시간 슬롯 (9:00 ~ 22:00)
  const timeSlots = generateTimeSlots(9, 22);
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-900 flex flex-col"
      style={{
        fontFamily:
          "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* 상단 헤더 */}
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          {/* 사이드바 토글 */}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          {/* 로고 */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm">
              친
            </div>
            <span className="text-lg font-semibold tracking-tight">친바</span>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-1">
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 transition-all">
            친바
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all">
            모이자
          </button>
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* 사이드바 (오버레이) */}
        {isSidebarOpen && (
          <>
            {/* 배경 오버레이 */}
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            {/* 사이드바 */}
            <aside className="fixed left-0 top-14 bottom-0 w-64 bg-white border-r border-gray-200 z-50 shadow-xl overflow-y-auto">
              <div className="p-3">
                {/* 안내 */}
                <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-xs text-blue-700 text-center">
                    방 코드를 입력하거나 새 방을 만들어보세요
                  </p>
                </div>

                {/* 최근 방 목록 (샘플) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      최근 방
                    </span>
                  </div>

                  <div className="text-center py-8 text-sm text-gray-400">
                    아직 참여한 방이 없습니다
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* 입장/생성 카드 */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* 방 입장 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-2">방 입장하기</h2>
                <p className="text-sm text-gray-500 mb-4">
                  이벤트 코드를 입력하여 방에 참여하세요
                </p>

                <form onSubmit={handleJoinEvent} className="space-y-3">
                  <input
                    type="text"
                    value={eventCode}
                    onChange={(e) => setEventCode(e.target.value)}
                    placeholder="예: test-event"
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
                    autoFocus
                  />

                  <button
                    type="submit"
                    disabled={!eventCode.trim()}
                    className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    입장하기
                  </button>
                </form>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 text-center">
                    테스트: <code className="text-blue-600">test-event</code>
                  </p>
                </div>
              </div>

              {/* 방 만들기 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-2">새 방 만들기</h2>
                <p className="text-sm text-gray-500 mb-4">
                  일정을 조율할 새로운 방을 만들어보세요
                </p>

                <button
                  onClick={() => alert('방 생성 기능은 곧 추가될 예정입니다!')}
                  className="w-full py-3 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
                >
                  방 생성하기
                </button>

                <div className="mt-4 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>요일 및 시간 범위 설정</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>공유 링크 자동 생성</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 시간표 그리드 미리보기 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-2">
                시간 조율 미리보기
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                친바는 이렇게 시간을 조율합니다
              </p>

              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                {/* 요일 헤더 */}
                <div
                  className="grid border-b border-gray-200"
                  style={{
                    gridTemplateColumns: `60px repeat(${days.length}, 1fr)`,
                  }}
                >
                  <div className="p-2 text-center text-xs text-gray-500 font-medium bg-gray-100">
                    시간
                  </div>
                  {days.map((day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-semibold bg-gray-100 border-l border-gray-200"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* 시간 슬롯 (일부만 표시) */}
                <div className="max-h-64 overflow-y-auto">
                  {timeSlots.slice(0, 10).map((time) => (
                    <div
                      key={time}
                      className="grid border-b border-gray-100 last:border-b-0"
                      style={{
                        gridTemplateColumns: `60px repeat(${days.length}, 1fr)`,
                      }}
                    >
                      <div
                        className={`px-2 py-1 text-xs text-gray-500 flex items-center justify-center ${
                          time.endsWith(':00') ? 'font-medium' : 'text-gray-400'
                        }`}
                      >
                        {time.endsWith(':00') ? time : ''}
                      </div>
                      {days.map((day) => (
                        <div
                          key={day}
                          className="h-6 border-l border-gray-100 bg-white hover:bg-blue-50 transition-colors cursor-pointer"
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* 안내 */}
                <div className="p-3 bg-gray-100 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-500">
                    방에 입장하면 드래그로 시간을 선택할 수 있습니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
