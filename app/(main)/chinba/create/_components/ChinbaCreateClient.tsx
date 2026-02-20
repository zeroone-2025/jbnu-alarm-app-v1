'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiXCircle } from 'react-icons/fi';
import Button from '@/_components/ui/Button';
import Toast from '@/_components/ui/Toast';
import FullPageModal from '@/_components/layout/FullPageModal';
import { getLoginUrl } from '@/_lib/utils/requireLogin';
import { useCreateChinbaEvent } from '@/_lib/hooks/useChinba';
import { useUser } from '@/_lib/hooks/useUser';
import DateSelector from './DateSelector';

export default function ChinbaCreateClient() {
  const router = useRouter();
  const createEvent = useCreateChinbaEvent();
  const { isLoggedIn } = useUser();

  const draftKey = 'chinba:create:draft';
  const [title, setTitle] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastKey, setToastKey] = useState(0);

  const canSubmit = title.trim().length > 0 && selectedDates.length > 0 && !createEvent.isPending;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(draftKey);
      if (!stored) return;
      const parsed = JSON.parse(stored) as { title?: string; selectedDates?: string[] };
      if (parsed.title) setTitle(parsed.title);
      if (Array.isArray(parsed.selectedDates)) setSelectedDates(parsed.selectedDates);
    } catch {
      // ignore localStorage errors
    }
  }, [draftKey]);

  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ title, selectedDates }));
    } catch {
      // ignore localStorage errors
    }
  }, [draftKey, title, selectedDates]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!isLoggedIn) {
      setToastMessage('로그인이 필요합니다');
      setToastVisible(true);
      setToastKey(prev => prev + 1);
      router.push(getLoginUrl('/chinba/create'));
      return;
    }
    setError(null);

    try {
      const result = await createEvent.mutateAsync({
        title: title.trim(),
        dates: selectedDates,
      });
      try {
        localStorage.removeItem(draftKey);
      } catch {
        // ignore localStorage errors
      }
      router.replace(`/chinba/event?id=${result.event_id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || '이벤트 생성에 실패했습니다');
    }
  };

  return (
    <>
      <FullPageModal isOpen={true} onClose={() => router.back()} title="새 일정 만들기">
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              모임 이름
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 조별과제 회의, 동아리 정기모임"
                maxLength={100}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-900 transition-colors"
              />
              {title.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTitle('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <FiXCircle size={18} />
                </button>
              )}
            </div>
            <p className="mt-1 text-[11px] text-gray-400 text-right">{title.length}/100</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              날짜 선택
            </label>
            <p className="text-xs text-gray-400 mb-3">
              후보 날짜를 클릭하거나 드래그하여 선택하세요
            </p>
            <div className="rounded-xl border border-gray-200 p-4">
              <DateSelector
                selectedDates={selectedDates}
                onChange={setSelectedDates}
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 py-3 pb-safe border-t border-gray-100">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mb-2"
          >
            {createEvent.isPending ? '만드는 중...' : '만들기'}
          </Button>
        </div>
      </FullPageModal>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        duration={2000}
        triggerKey={toastKey}
      />
    </>
  );
}
