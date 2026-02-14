'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MAJOR_PRESETS } from '@/_lib/constants/presets';
import { GUEST_DEFAULT_BOARDS } from '@/_lib/constants/boards';
import { completeOnboarding } from '@/_lib/api';
import UserInfoForm, { UserInfoFormData } from '@/_components/auth/UserInfoForm';
import FullPageModal from '@/_components/layout/FullPageModal';
import Logo from '@/_components/ui/Logo';
import { useUserStore } from '@/_lib/store/useUserStore';
import { FiCheck } from 'react-icons/fi';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (categories: string[]) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type UserType = 'student' | 'mentor';

export default function OnboardingModal({ isOpen, onComplete, onShowToast }: OnboardingModalProps) {
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  const [step, setStep] = useState<1 | 2>(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState<UserInfoFormData>({
    nickname: '',
    school: '전북대',
    dept_code: '',
    dept_name: '',
    admission_year: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
  };

  const handleNext = () => {
    if (!userType) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!userType) return;

    setIsSubmitting(true);

    let boardCodes: string[] = [...GUEST_DEFAULT_BOARDS];
    if (userType === 'student' && formData.dept_code) {
      const preset = MAJOR_PRESETS.find(
        (p) => p.label === formData.dept_name || p.id === formData.dept_code.replace('dept_', ''),
      );
      if (preset) {
        boardCodes = preset.categories;
      } else {
        boardCodes.push(formData.dept_code);
      }
    }

    try {
      const result = await completeOnboarding({
        user_type: userType,
        school: formData.school || '전북대',
        dept_code: formData.dept_code || undefined,
        admission_year: formData.admission_year ? parseInt(formData.admission_year) : undefined,
        board_codes: boardCodes,
      });

      queryClient.setQueryData(['user', 'profile'], result.user);
      setUser(result.user);
      localStorage.setItem('my_subscribed_categories', JSON.stringify(result.subscribed_boards));
      onShowToast?.('제로타임에 오신 것을 환영합니다! 🎉', 'success');
      onComplete(result.subscribed_boards);
    } catch (error) {
      console.error('온보딩 처리 실패:', error);
      alert('정보 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!userType) return;

    const confirmMessage =
      userType === 'student'
        ? '학과 정보를 입력하지 않고 시작할까요?\n나중에 설정에서 언제든지 변경할 수 있습니다.'
        : '학교 정보 없이 시작할까요?\n나중에 설정에서 언제든지 변경할 수 있습니다.';
    if (!confirm(confirmMessage)) return;

    setIsSubmitting(true);
    try {
      const defaultBoards = [...GUEST_DEFAULT_BOARDS];
      const result = await completeOnboarding({
        user_type: userType,
        school: '전북대',
        board_codes: defaultBoards,
      });

      queryClient.setQueryData(['user', 'profile'], result.user);
      setUser(result.user);
      localStorage.setItem('my_subscribed_categories', JSON.stringify(defaultBoards));
      onShowToast?.('제로타임에 오신 것을 환영합니다! 🎉', 'success');
      onComplete(defaultBoards);
    } catch (error) {
      console.error('건너뛰기 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FullPageModal isOpen={isOpen} onClose={() => {}} title="환영합니다!">
      {step === 1 && (
        <div className="flex min-h-full flex-col px-5 py-8">
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <Logo className="h-12" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              제로타임에 오신 것을 환영합니다!
            </h2>
            <p className="text-sm text-gray-500">나에게 해당하는 유형을 선택해주세요</p>
          </div>

          <div className="grid grid-cols-2 gap-3 px-2">
            <button
              onClick={() => handleUserTypeSelect('student')}
              className={`relative flex flex-col items-center rounded-2xl border-2 p-5 transition-all ${
                userType === 'student'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {userType === 'student' && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                  <FiCheck size={12} strokeWidth={3} />
                </div>
              )}
              <div className="mb-3 text-4xl">🎓</div>
              <p className="text-base font-bold text-gray-800">학생</p>
              <p className="mt-1 text-xs text-gray-400">재학생/신입생</p>
            </button>

            <button
              onClick={() => handleUserTypeSelect('mentor')}
              className={`relative flex flex-col items-center rounded-2xl border-2 p-5 transition-all ${
                userType === 'mentor'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {userType === 'mentor' && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                  <FiCheck size={12} strokeWidth={3} />
                </div>
              )}
              <div className="mb-3 text-4xl">💼</div>
              <p className="text-base font-bold text-gray-800">재직자</p>
              <p className="mt-1 text-xs text-gray-400">선배/멘토</p>
            </button>
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-10 pb-safe">
            <button
              onClick={handleNext}
              disabled={!userType}
              className="w-full rounded-xl bg-gray-900 py-4 font-bold text-white transition-all hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex min-h-full flex-col px-5 py-8">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              {userType === 'student' ? '학교 정보를 알려주세요' : '학교 정보 (선택)'}
            </h2>
            <p className="text-sm text-gray-500">
              {userType === 'student' ? (
                <>
                  소속 정보를 알려주시면
                  <br />
                  맞춤형 공지사항을 자동으로 구독해 드려요!
                </>
              ) : (
                <>
                  학교와 학과 정보는 선택사항이에요
                  <br />
                  건너뛰셔도 괜찮습니다
                </>
              )}
            </p>
            <button
              onClick={() => {
                setStep(1);
                setUserType(null);
              }}
              className="mt-3 text-xs font-medium text-gray-400 transition-all hover:text-gray-600"
            >
              학생/재직자 다시 선택하기
            </button>
          </div>

          <div className="flex-1 space-y-6">
            <UserInfoForm
              formData={formData}
              onChange={(data) => setFormData((prev: UserInfoFormData) => ({ ...prev, ...data }))}
              showNickname={false}
              isReadonlySchool={false}
            />
          </div>

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
      )}
    </FullPageModal>
  );
}
