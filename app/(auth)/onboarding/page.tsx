'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import OnboardingModal from '../../(main)/(home)/_components/OnboardingModal';
import { ToastProvider, useToast } from '@/_context/ToastContext';
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
  const didTryResumeRef = useRef(false);

  // 이미 온보딩 완료한 유저는 홈으로 리다이렉트
  useEffect(() => {
    if (!isAuthLoaded) return;
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
        showToast('온보딩 정보가 저장되었습니다.', 'success');
        router.replace('/');
      } catch (error) {
        console.error('온보딩 재저장 실패:', error);
        showToast('저장에 실패했습니다. 온보딩에서 다시 완료해 주세요.', 'error');
      } finally {
        setIsResumingSubmit(false);
      }
    })();
  }, [isAuthLoaded, isLoggedIn, queryClient, router, searchParams, setUser, showToast, user?.email, user?.nickname]);

  const handleOnboardingComplete = (categories: string[]) => {
    localStorage.setItem('my_subscribed_categories', JSON.stringify(categories));
    clearPendingOnboarding();
    router.replace('/');
  };

  const handleRequireLogin = () => {
    const redirectTo = '/?resume_onboarding=true';
    router.push(`/login?redirect_to=${encodeURIComponent(redirectTo)}`);
  };

  if (!isAuthLoaded || isResumingSubmit) {
    return (
      <div className="min-h-dvh bg-gray-50">
        <div className="mx-auto flex min-h-dvh w-full max-w-md md:max-w-[calc(280px+56rem)] md:shadow-xl">
          <div className="flex min-h-dvh w-full flex-1 items-center justify-center border-x border-gray-100 bg-white shadow-xl md:shadow-none">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <OnboardingModal
      isOpen
      onComplete={handleOnboardingComplete}
      onShowToast={showToast}
      isLoggedIn={isLoggedIn}
      onRequireLogin={handleRequireLogin}
    />
  );
}

function OnboardingFallback() {
  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="mx-auto flex min-h-dvh w-full max-w-md md:max-w-[calc(280px+56rem)] md:shadow-xl">
        <div className="flex min-h-dvh w-full flex-1 items-center justify-center border-x border-gray-100 bg-white shadow-xl md:shadow-none">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
        </div>
      </div>
    </div>
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
