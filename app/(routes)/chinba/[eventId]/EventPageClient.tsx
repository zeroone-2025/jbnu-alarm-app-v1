'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useParticipant } from '../hooks/useParticipant';
import { useEventData } from '../hooks/useEventData';
import { useTimeSelection } from '../hooks/useTimeSelection';
import { generateTimeSlots, calculateFreeTime, formatDateTime, scrollToTimeSlot } from '../lib/utils';
import EventHeader from '../components/EventHeader';
import JoinModal from '../components/JoinModal';
import ParticipantSidebar from '../components/ParticipantSidebar';
import DaySelector from '../components/DaySelector';
import TimeGrid from '../components/TimeGrid';
import DirectTimeInput from '../components/DirectTimeInput';
import FreeTimeList from '../components/FreeTimeList';
import type { DayOfWeek } from '../types';

interface EventPageClientProps {
  eventId: string;
}

export default function EventPageClient({ eventId }: EventPageClientProps) {
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [showDirectInput, setShowDirectInput] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // 사이드바 토글
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // 추가 성공 메시지

  // 커스텀 훅
  const {
    isParticipant,
    participantId,
    participantName,
    joinEvent,
    logout,
    leaveEvent,
    isLoading: isJoining,
  } = useParticipant(eventId);

  const { eventData, isLoading, error, refreshEvent, saveAvailability } =
    useEventData(eventId);

  const {
    selectedSlots,
    mode,
    setMode,
    addSlotRange,
    setSlots,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
  } = useTimeSelection();

  // 이벤트 데이터 로드 후 초기 설정
  useEffect(() => {
    if (eventData) {
      // 모든 요일을 기본 선택
      const allDays = eventData.dates.map((date) => {
        const { day } = formatDateTime(`${date}T00:00:00`);
        return day;
      });
      setSelectedDays(allDays);
    }
  }, [eventData]);

  // 시간 슬롯 생성
  const timeSlots = eventData
    ? generateTimeSlots(eventData.time_range.start, eventData.time_range.end)
    : [];

  // FREE TIME 계산
  const freeTimeSlots = eventData
    ? calculateFreeTime(
        eventData.heatmap,
        eventData.dates,
        eventData.time_range.start,
        eventData.time_range.end
      )
    : [];

  // 저장하기
  const handleSave = () => {
    if (!participantId) return;
    
    try {
      saveAvailability(participantId, Array.from(selectedSlots));
      alert('저장되었습니다!');
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // FREE TIME 클릭 시 스크롤
  const handleFreeTimeClick = (dt: string) => {
    if (gridContainerRef.current) {
      scrollToTimeSlot(gridContainerRef as React.RefObject<HTMLElement>, dt);
    }
  };

  // 직접 작성 추가 핸들러
  const handleAddSlots = (slots: string[]) => {
    // slots는 이미 ISO 문자열 배열이므로 직접 Set에 추가
    setSlots([...selectedSlots, ...slots]);
    
    // 성공 메시지 표시
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 2000);
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  // 에러
  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">이벤트를 찾을 수 없습니다</h1>
          <p className="text-gray-500">{error || '다시 시도해주세요.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen bg-gray-50 text-gray-900 flex flex-col"
      style={{
        fontFamily:
          "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* 참가 모달 */}
      <JoinModal
        isOpen={!isParticipant}
        onJoin={joinEvent}
        isLoading={isJoining}
      />

      {/* 헤더 */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white z-50 shadow-sm flex-shrink-0">
        {/* 사이드바 토글 버튼 */}
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
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

        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-center px-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs sm:text-sm flex-shrink-0">
            친
          </div>
          <span className="font-semibold tracking-tight truncate text-xs sm:text-sm md:text-base lg:text-lg">
            {eventData.title}
          </span>
        </div>

        <button
          onClick={() => {
            const url = `${window.location.origin}/chinba/${eventId}`;
            navigator.clipboard.writeText(url);
            alert('링크가 복사되었습니다!');
          }}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-xs sm:text-sm flex-shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span className="hidden md:inline">초대 링크 복사</span>
          <span className="md:hidden">복사</span>
        </button>
      </div>

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
            <div className="fixed left-0 top-14 bottom-0 w-72 bg-white border-r border-gray-200 z-50 shadow-xl">
              <ParticipantSidebar
                participants={eventData.participants}
                currentParticipantName={participantName}
                onLogout={logout}
                onLeave={leaveEvent}
                onHoverParticipant={setHoveredMember}
              />
            </div>
          </>
        )}

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* 상단 액션 */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1 text-gray-900">
                  내 가능 시간 선택
                </h2>
                <p className="text-sm text-gray-500">
                  {mode === 'grid'
                    ? '드래그하여 여러 시간대를 한번에 선택하세요'
                    : '요일과 시간을 선택하여 추가하세요'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDirectInput(!showDirectInput)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showDirectInput
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {showDirectInput ? '그리드 모드' : '직접 작성'}
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  저장하기
                </button>
              </div>
            </div>

            {/* 성공 메시지 */}
            {showSuccessMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-sm font-medium">확인되었습니다</span>
              </div>
            )}

            {/* 요일 선택 */}
            <DaySelector
              availableDays={eventData.dates.map((date) => {
                const { day } = formatDateTime(`${date}T00:00:00`);
                return day;
              })}
              selectedDays={selectedDays}
              onDaysChange={setSelectedDays}
            />

            {/* 직접 작성 모드 */}
            {showDirectInput && (
              <DirectTimeInput
                dates={eventData.dates}
                timeSlots={timeSlots}
                onAddSlots={handleAddSlots}
              />
            )}

            {/* 시간 그리드 */}
            <div ref={gridContainerRef}>
              <TimeGrid
                dates={eventData.dates}
                selectedDays={selectedDays}
                timeSlots={timeSlots}
                selectedSlots={selectedSlots}
                heatmap={eventData.heatmap}
                totalParticipants={eventData.participants.length}
                hoveredMember={hoveredMember}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onMouseUp={handleMouseUp}
              />
            </div>

            {/* FREE TIME */}
            <FreeTimeList
              freeTimeSlots={freeTimeSlots}
              onSlotClick={handleFreeTimeClick}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
