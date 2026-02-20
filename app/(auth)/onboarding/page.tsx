'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import OnboardingModal from '../../(main)/(home)/_components/OnboardingModal';
import { ToastProvider, useToast } from '@/_context/ToastContext';
import AuthPageShell from '@/_components/layout/AuthPageShell';
import { useUser } from '@/_lib/hooks/useUser';
import { useUserStore } from '@/_lib/store/useUserStore';
import {
  clearPendingOnboarding,
  loadPendingOnboarding,
  submitPendingOnboarding,
} from '@/_lib/onboarding/pendingSubmission';

function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { isAuthLoaded, isLoggedIn, user } = useUser();
  const setUser = useUserStore((state) => state.setUser);

  const [isResumingSubmit, setIsResumingSubmit] = useState(false);
  const [mentorCongratsBoards, setMentorCongratsBoards] = useState<string[] | null>(null);
  const didTryResumeRef = useRef(false);
  const onboardingCompletedRef = useRef(false);

  // auth/callback에서 멘토 온보딩 완료 후 리다이렉트된 경우 축하 화면 표시
  useEffect(() => {
    if (searchParams.get('mentor_completed') !== 'true') return;
    onboardingCompletedRef.current = true;
    try {
      const stored = localStorage.getItem('my_subscribed_categories');
      setMentorCongratsBoards(stored ? JSON.parse(stored) : []);
    } catch {
      setMentorCongratsBoards([]);
    }
  }, [searchParams]);

  // 이미 온보딩 완료한 유저는 홈으로 리다이렉트 (축하 화면 표시 중이면 제외)
  useEffect(() => {
    if (!isAuthLoaded) return;
    if (onboardingCompletedRef.current) return;
    if (isLoggedIn && user?.dept_code) {
      router.replace('/');
    }
  }, [isAuthLoaded, isLoggedIn, user?.dept_code, router]);

  useEffect(() => {
    if (!isAuthLoaded || !isLoggedIn || didTryResumeRef.current) return;
    if (searchParams.get('resume_onboarding') !== 'true') return;

    didTryResumeRef.current = true;
    const pendingData = loadPendingOnboarding();
    if (!pendingData) return;

    setIsResumingSubmit(true);
    (async () => {
      try {
        const payloadToSubmit = pendingData.mentorCareer
          ? {
              ...pendingData,
              mentorCareer: {
                ...pendingData.mentorCareer,
                contact: {
                  ...pendingData.mentorCareer.contact,
                  name: pendingData.mentorCareer.contact.name || user?.nickname || null,
                  email: pendingData.mentorCareer.contact.email || user?.email || null,
                },
              },
            }
          : pendingData;

        const result = await submitPendingOnboarding(payloadToSubmit);
        queryClient.setQueryData(['user', 'profile'], result.user);
        setUser(result.user);
        localStorage.setItem('my_subscribed_categories', JSON.stringify(result.subscribedBoards));
        clearPendingOnboarding();

        if (pendingData.mentorCareer) {
          onboardingCompletedRef.current = true;
          setMentorCongratsBoards(result.subscribedBoards);
        } else {
          showToast('온보딩 정보가 저장되었습니다.', 'success');
          router.replace('/');
        }
      } catch (error) {
        console.error('온보딩 재저장 실패:', error);
        showToast('저장에 실패했습니다. 온보딩에서 다시 완료해 주세요.', 'error');
      } finally {
        setIsResumingSubmit(false);
      }
    })();
  }, [isAuthLoaded, isLoggedIn, queryClient, router, searchParams, setUser, showToast, user?.email, user?.nickname]);

  const handleOnboardingComplete = async (categories: string[]) => {
    localStorage.setItem('my_subscribed_categories', JSON.stringify(categories));
    clearPendingOnboarding();
    await router.replace('/');
  };

  const handleRequireLogin = () => {
    const redirectTo = '/onboarding?resume_onboarding=true';
    router.push(`/login?redirect_to=${encodeURIComponent(redirectTo)}`);
  };

  const handleMentorOnboardingCompleted = () => {
    onboardingCompletedRef.current = true;
  };

  if (!isAuthLoaded || isResumingSubmit) {
    return (
      <AuthPageShell center>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
      </AuthPageShell>
    );
  }

  if (mentorCongratsBoards) {
    return (
      <AuthPageShell center>
        <div className="flex flex-col items-center px-5 py-12">
          <div className="mb-6 text-7xl">🎉</div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">환영합니다, 선배님!</h2>
          <p className="mb-2 text-center text-sm leading-relaxed text-gray-500">
            멘토 정보가 성공적으로 등록되었습니다.
            <br />
            후배들에게 큰 도움이 될 거예요!
          </p>
          <p className="mb-10 text-center text-xs text-gray-400">
            프로필 &gt; 이력관리에서 언제든지 수정할 수 있습니다.
          </p>
          <button
            onClick={() => handleOnboardingComplete(mentorCongratsBoards)}
            className="w-full max-w-xs rounded-xl bg-gray-900 py-4 font-bold text-white transition-all hover:bg-gray-800"
          >
            제로타임 둘러보기
          </button>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <OnboardingModal
        isOpen
        onComplete={handleOnboardingComplete}
        onShowToast={showToast}
        isLoggedIn={isLoggedIn}
        onRequireLogin={handleRequireLogin}
        onMentorCompleted={handleMentorOnboardingCompleted}
      />
    </AuthPageShell>
  );
}

function OnboardingFallback() {
  return (
    <AuthPageShell center>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
    </AuthPageShell>
  );
}

export default function OnboardingPage() {
  return (
    <ToastProvider>
      <Suspense fallback={<OnboardingFallback />}>
        <OnboardingPageContent />
      </Suspense>
    </ToastProvider>
  );
}
