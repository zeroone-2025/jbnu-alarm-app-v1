'use client';

import { useState } from 'react';
import { completeOnboarding } from '@/_lib/api';
import UserInfoForm, { UserInfoFormData } from '@/_components/auth/UserInfoForm';
import FullPageModal from '@/_components/layout/FullPageModal';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (categories: string[]) => void;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [formData, setFormData] = useState<UserInfoFormData>({
    nickname: '',
    school: '전북대',
    dept_code: '',
    dept_name: '',
    admission_year: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // 구독할 게시판 결정
    let boardCodes: string[] = ['home_campus']; // 기본값: 본부 공지

    if (formData.dept_code) {
      // 학과/계열 코드만 전달하면 백엔드에서 dept_presets 기준으로 자동 확장됨
      boardCodes.push(formData.dept_code);
    }

    try {
      const result = await completeOnboarding({
        school: formData.school,
        dept_code: formData.dept_code || undefined,
        admission_year: formData.admission_year ? parseInt(formData.admission_year) : undefined,
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
    <FullPageModal
      isOpen={isOpen}
      onClose={() => { }} // 온보딩은 닫기 불가
      title="환영합니다!"
    >
      <div className="flex min-h-full flex-col px-5 py-8">
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

        <div className="flex-1 space-y-6">
          <UserInfoForm
            formData={formData}
            onChange={(data) => setFormData((prev: UserInfoFormData) => ({ ...prev, ...data }))}
            showNickname={false}
            isReadonlySchool={true}
          />
        </div>

        {/* 하단 버튼 영역 - Safe area 고려 */}
        <div className="mt-10 flex flex-col gap-3 pb-safe">
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
    </FullPageModal>
  );
}
