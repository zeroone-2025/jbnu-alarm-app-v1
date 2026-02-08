'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiUpload } from 'react-icons/fi';
import Button from '@/_components/ui/Button';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import Toast from '@/_components/ui/Toast';
import ConfirmModal from '@/_components/ui/ConfirmModal';
import LoginButtonGroup from '@/_components/auth/LoginButtonGroup';
import ChinbaScheduleGrid from './ChinbaScheduleGrid';
import { useMyParticipation, useUpdateUnavailability, useImportTimetable } from '@/_lib/hooks/useChinba';

interface MyScheduleTabProps {
  eventId: string;
  dates: string[];
  startHour: number;
  endHour: number;
  isLoggedIn: boolean;
}

export default function MyScheduleTab({ eventId, dates, startHour, endHour, isLoggedIn }: MyScheduleTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: participation, isLoading } = useMyParticipation(isLoggedIn ? eventId : undefined);
  const updateMutation = useUpdateUnavailability(eventId);
  const importMutation = useImportTimetable(eventId);

  const draftKey = `chinba:event:${eventId}:draft-unavailable`;
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [hasDraft, setHasDraft] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showNoTimetableModal, setShowNoTimetableModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const loginPromptRef = useRef<HTMLDivElement>(null);

  // Load existing unavailable slots (logged in only)
  useEffect(() => {
    if (participation?.unavailable_slots && !hasDraft) {
      setSelectedSlots(new Set(participation.unavailable_slots));
    }
  }, [participation?.unavailable_slots, hasDraft]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(draftKey);
      if (!stored) {
        setDraftLoaded(true);
        return;
      }
      const parsed = JSON.parse(stored) as { slots?: string[]; updatedAt?: number };
      if (Array.isArray(parsed?.slots)) {
        setSelectedSlots(new Set(parsed.slots));
        setHasDraft(true);
      }
    } catch {
      // ignore localStorage errors
    } finally {
      setDraftLoaded(true);
    }
  }, [draftKey]);

  const handleSlotsChange = useCallback((slots: Set<string>) => {
    setSelectedSlots(slots);
  }, []);

  useEffect(() => {
    if (isLoggedIn) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({ slots: Array.from(selectedSlots), updatedAt: Date.now() })
      );
    } catch {
      // ignore localStorage errors
    }
  }, [draftKey, isLoggedIn, selectedSlots]);

  const handleSave = async () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      requestAnimationFrame(() => {
        loginPromptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
    try {
      await updateMutation.mutateAsync({
        unavailable_slots: Array.from(selectedSlots),
      });
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', 'team');
      params.set('toast', 'save');
      router.replace(`/chinba/event?${params.toString()}`);
      try {
        localStorage.removeItem(draftKey);
      } catch {
        // ignore localStorage errors
      }
      setHasDraft(false);
    } catch (err: any) {
      setToastMessage(err.response?.data?.detail || '저장에 실패했습니다');
      setToastType('error');
      setToastVisible(true);
      setToastKey(prev => prev + 1);
    }
  };

  const handleImport = async () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      const result = await importMutation.mutateAsync();
      setToastMessage(result.message);
      setToastType('success');
      setToastVisible(true);
      setToastKey(prev => prev + 1);
      try {
        localStorage.removeItem(draftKey);
      } catch {
        // ignore localStorage errors
      }
      setHasDraft(false);
    } catch (err: any) {
      const detail = err.response?.data?.detail as string | undefined;
      const status = err.response?.status as number | undefined;
      const isNoTimetable =
        status === 404 && !!detail && (detail.includes('시간표를 찾을 수 없습니다') || detail.includes('시간표에 수업이 없습니다'));

      if (isNoTimetable) {
        setShowNoTimetableModal(true);
        return;
      }

      setToastMessage(detail || '시간표 불러오기에 실패했습니다');
      setToastType('error');
      setToastVisible(true);
      setToastKey(prev => prev + 1);
    }
  };

  if (isLoggedIn && (isLoading || !draftLoaded)) {
    return (
      <div className="flex h-40 items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="px-4 pb-6">
      {/* Info card */}
      <div className="mb-4 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5">
        <p className="text-xs text-blue-700 font-medium">
          불가능한 시간을 드래그로 선택해주세요
        </p>
        <p className="text-[10px] text-blue-500 mt-0.5">
          빨간색으로 표시된 시간이 불가능한 시간입니다
        </p>
      </div>

      {/* Import button */}
      <button
        onClick={handleImport}
        disabled={importMutation.isPending}
        className="mb-4 w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {importMutation.isPending ? (
          <LoadingSpinner size="sm" />
        ) : (
          <FiUpload size={14} />
        )}
        내 시간표 불러오기
      </button>

      {/* Schedule Grid */}
      <div className="mb-4 rounded-xl border border-gray-200 p-2 overflow-hidden">
        <ChinbaScheduleGrid
          dates={dates}
          startHour={startHour}
          endHour={endHour}
          selectedSlots={selectedSlots}
          onSlotsChange={handleSlotsChange}
        />
      </div>

      {/* Save button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleSave}
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            저장 중...
          </span>
        ) : (
          '저장하기'
        )}
      </Button>

      {/* Login prompt overlay */}
      {showLoginPrompt && (
        <div ref={loginPromptRef} className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-gray-800 text-center mb-1">
            저장하려면 로그인이 필요합니다
          </p>
          <p className="text-xs text-gray-500 text-center mb-4">
            소셜 로그인으로 1초만에 가입하세요!
          </p>
          <LoginButtonGroup />
          <button
            onClick={() => setShowLoginPrompt(false)}
            className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600"
          >
            닫기
          </button>
        </div>
      )}

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        duration={2000}
        type={toastType}
        triggerKey={toastKey}
      />

      <ConfirmModal
        isOpen={showNoTimetableModal}
        title="저장된 시간표가 없습니다"
        confirmLabel="등록하러 가기"
        cancelLabel="취소"
        onConfirm={() => router.push('/profile?tab=timetable')}
        onCancel={() => setShowNoTimetableModal(false)}
      >
        시간표를 등록하고 1초만에 불러오세요.
      </ConfirmModal>
    </div>
  );
}
