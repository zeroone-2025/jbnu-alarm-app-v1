'use client';

import { useState } from 'react';
import { MAJOR_PRESETS } from '@/constants/presets';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (categories: string[]) => void;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [selectedMajor, setSelectedMajor] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedMajor) {
      alert('학과를 선택해주세요!');
      return;
    }

    const preset = MAJOR_PRESETS.find((p) => p.id === selectedMajor);
    if (!preset) return;

    // localStorage에 구독 카테고리 저장
    localStorage.setItem('my_subscribed_categories', JSON.stringify(preset.categories));

    // 부모 컴포넌트에 알림
    onComplete(preset.categories);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        {/* 헤더 */}
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">🎓</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            ZeroTime에 오신 것을 환영합니다!
          </h2>
          <p className="text-sm text-gray-600">
            학과를 선택하시면 필수 공지사항을 자동으로 구독해 드려요!
          </p>
        </div>

        {/* 학과 선택 */}
        <div className="mb-6">
          <label htmlFor="major-select" className="mb-2 block text-sm font-medium text-gray-700">
            학과 선택
          </label>
          <select
            id="major-select"
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">-- 학과를 선택하세요 --</option>
            {MAJOR_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        {/* 선택된 학과 미리보기 */}
        {selectedMajor && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <p className="mb-2 text-xs font-semibold text-blue-900">구독할 카테고리:</p>
            <div className="flex flex-wrap gap-2">
              {MAJOR_PRESETS.find((p) => p.id === selectedMajor)?.categories.map((catId) => (
                <span
                  key={catId}
                  className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {catId}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!selectedMajor}
          className="w-full rounded-lg bg-blue-500 py-3 font-semibold text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          시작하기
        </button>

        {/* 안내 문구 */}
        <p className="mt-4 text-center text-xs text-gray-500">
          나중에 설정에서 구독 카테고리를 변경할 수 있어요
        </p>
      </div>
    </div>
  );
}
