'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserProfile } from '@/_lib/api';
import { useUserStore } from '@/_lib/store/useUserStore';
import { setAccessToken } from '@/_lib/auth/tokenStore';
import {
  clearPendingOnboarding,
  loadPendingOnboarding,
  submitPendingOnboarding,
} from '@/_lib/onboarding/pendingSubmission';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedRef = useRef(false);
  const [status, setStatus] = useState('로그인 처리 중...');
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const accessToken = searchParams.get('access_token');
    const error = searchParams.get('error');
    const redirectTo = searchParams.get('redirect_to');
    const safeRedirect = redirectTo?.startsWith('/') ? redirectTo : null;
    const shouldResumeOnboarding = safeRedirect?.includes('resume_onboarding=true') ?? false;

    // 사용자가 로그인을 취소한 경우
    if (error === 'access_denied') {
      setStatus('로그인이 취소되었습니다.');
      setTimeout(() => {
        router.replace(safeRedirect || '/');
      }, 800);
      return;
    }

    // 이메일 미제공 에러 (Kakao 등)
    if (error === 'email_required') {
      setStatus('이메일 정보가 필요합니다. 카카오 계정에 이메일을 등록해주세요.');
      setTimeout(() => {
        router.replace(safeRedirect || '/');
      }, 3000);
      return;
    }

    // 기타 에러가 있는 경우
    if (error) {
      setStatus('로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
      setTimeout(() => {
        router.replace(safeRedirect || '/');
      }, 2000);
      return;
    }

    if (accessToken) {
      const processLogin = async () => {
        try {
          // 1. 백엔드에서 전달받은 JWT를 메모리에 저장
          setAccessToken(accessToken);
          setStatus('로그인 성공! 사용자 정보를 확인하는 중...');

          // 2. 사용자 정보 조회
          const userProfile = await getUserProfile();

          // 3. Zustand Store 업데이트 (리다이렉트 전 즉시 반영)
          setUser(userProfile);

          // 온보딩 재개 저장 플로우: 콜백에서 바로 저장 후 홈으로 이동
          if (shouldResumeOnboarding) {
            setStatus('온보딩 정보를 저장하는 중...');
            const pendingData = loadPendingOnboarding();

            if (pendingData) {
              const payloadToSubmit = pendingData.mentorCareer
                ? {
                    ...pendingData,
                    mentorCareer: {
                      ...pendingData.mentorCareer,
                      contact: {
                        ...pendingData.mentorCareer.contact,
                        name: pendingData.mentorCareer.contact.name || userProfile.nickname || null,
                        email: pendingData.mentorCareer.contact.email || userProfile.email || null,
                      },
                    },
                  }
                : pendingData;

              const saveResult = await submitPendingOnboarding(payloadToSubmit);
              setUser(saveResult.user);
              localStorage.setItem('my_subscribed_categories', JSON.stringify(saveResult.subscribedBoards));
              clearPendingOnboarding();

              if (pendingData.mentorCareer) {
                setTimeout(() => {
                  router.replace('/onboarding?mentor_completed=true');
                }, 300);
                return;
              }
            }

            setTimeout(() => {
              router.replace('/?login=success');
            }, 300);
            return;
          }

          // 4. 온보딩 완료 여부 확인 (레거시 데이터 보호: dept_code가 있으면 완료로 간주)
          const isOnboardingCompleted = userProfile.onboarding_completed || !!userProfile.dept_code;
          if (!isOnboardingCompleted) {
            // 미완료 사용자: 항상 온보딩 페이지로 이동 (safeRedirect 무시)
            setStatus('환영합니다! 온보딩을 완료해주세요.');
            setTimeout(() => {
              router.replace('/onboarding?login=success');
            }, 500);
          } else {
            // 기존 사용자: 바로 홈으로
            setStatus('로그인 성공! 홈으로 이동합니다.');
            setTimeout(() => {
              router.replace(safeRedirect || '/?login=success');
            }, 500);
          }
        } catch (error) {
          console.error('Login failed:', error);
          setStatus('로그인 실패. 다시 시도해주세요.');

          // 실패 시 홈으로 이동
          setTimeout(() => {
            router.replace(safeRedirect || '/');
          }, 2000);
        }
      };

      processLogin();
    } else {
      console.error('No access_token parameter found in URL');
      setStatus('잘못된 접근입니다. 홈으로 이동합니다.');

      setTimeout(() => {
        router.replace(safeRedirect || '/');
      }, 2000);
    }
  }, [searchParams, router, setUser]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* 로딩 스피너 */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
        {/* 로딩 문구 */}
        <p className="text-sm text-gray-600">로그인 중입니다...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
          <p className="text-sm text-gray-600">로그인 중입니다...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
