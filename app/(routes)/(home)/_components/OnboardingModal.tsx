'use client';

import { useState } from 'react';
import { MAJOR_PRESETS } from '@/_lib/constants/presets';
import { completeOnboarding } from '@/_lib/api';
import DepartmentSearch from '@/_components/ui/DepartmentSearch';
import type { Department } from '@/_types/department';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (categories: string[]) => void;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [admissionYear, setAdmissionYear] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // 구독할 게시판 결정
    let boardCodes: string[] = ['home_campus']; // 기본값: 본부 공지
    
    if (selectedDept) {
      // 프리셋이 있는지 확인 (라벨 또는 코드 매칭)
      const preset = MAJOR_PRESETS.find(
        (p) => p.label === selectedDept.dept_name || p.id === selectedDept.dept_code.replace('dept_', '')
      );
      
      if (preset) {
        boardCodes = preset.categories;
      } else {
        // 프리셋 없으면 해당 학과 게시판 추가
        boardCodes.push(selectedDept.dept_code);
      }
    }

    try {
      const result = await completeOnboarding({
        school: '전북대',
        dept_code: selectedDept?.dept_code || undefined,
        admission_year: admissionYear ? parseInt(admissionYear) : undefined,
        board_codes: boardCodes,
      });

      // localStorage 캐시 저장
      localStorage.setItem('my_subscribed_categories', JSON.stringify(result.subscribed_boards));

      // 부모 컴포넌트에 알림
      onComplete(result.subscribed_boards);
    } catch (error) {
      console.error('온보딩 처리 실패:', error);
      alert('정보 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!confirm('학과 정보를 입력하지 않고 시작할까요?\n나중에 설정에서 언제든지 변경할 수 있습니다.')) return;
    
    setIsSubmitting(true);
    try {
      const defaultBoards = ['home_campus'];
      await completeOnboarding({
        school: '전북대',
        board_codes: defaultBoards,
      });
      
      localStorage.setItem('my_subscribed_categories', JSON.stringify(defaultBoards));
      onComplete(defaultBoards);
    } catch (error) {
      console.error('건너뛰기 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">🎓</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            ZeroTime에 오신 것을 환영합니다!
          </h2>
          <p className="text-sm text-gray-500">
            소속 정보를 알려주시면<br />맞춤형 공지사항을 자동으로 구독해 드려요!
          </p>
        </div>

        <div className="space-y-6">
          {/* 학교 선택 (고정) */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">
              학교
            </label>
            <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-lg font-medium text-gray-500">
              전북대학교
            </div>
          </div>

          {/* 학과 선택 */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">
              학과 (선택사항)
            </label>
            <DepartmentSearch onSelect={setSelectedDept} />
          </div>

          {/* 학번/입학년도 선택 */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">
              학번 (선택사항)
            </label>
            <select
              value={admissionYear}
              onChange={(e) => setAdmissionYear(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-5 py-4 text-lg font-medium text-gray-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">-- 학번을 선택하세요 --</option>
              {Array.from({ length: 17 }, (_, i) => 26 - i).map((year) => (
                <option key={year} value={year}>{year}학번</option>
              ))}
            </select>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-10 flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gray-900 py-4 font-bold text-white transition-all hover:bg-gray-800 disabled:bg-gray-300"
          >
            {isSubmitting ? '준비 중...' : '시작하기'}
          </button>
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full py-2 text-sm font-medium text-gray-400 transition-all hover:text-gray-600"
          >
            건너뛰기
          </button>
        </div>
      </div>
    </div>
  );
}
