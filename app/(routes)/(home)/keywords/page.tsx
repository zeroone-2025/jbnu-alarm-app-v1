'use client';

import { useUser } from '@/_lib/hooks/useUser';
import FullPageModal from '@/_components/layout/FullPageModal';
import KeywordsModalContent from './_components/KeywordsModalContent';
import Button from '@/_components/ui/Button';
import { useRouter } from 'next/navigation'; // Added missing import for useRouter
import { useEffect } from 'react'; // Added missing import for useEffect

/**
 * 키워드 관리 페이지
 * - 키워드 추가/삭제
 * - FullPageModal을 사용한 전체 화면 UI
 */
export default function KeywordsPage() {
  const router = useRouter();
  const { isLoggedIn, isAuthLoaded } = useUser();

  useEffect(() => {
    if (isAuthLoaded && !isLoggedIn) {
      router.replace('/');
    }
  }, [isAuthLoaded, isLoggedIn, router]);

  const handleClose = () => {
    router.back();
  };

  const handleUpdate = () => {
    // 키워드 업데이트 완료
    // 페이지는 그대로 유지 (사용자가 뒤로가기로 이동)
  };

  // 인증 상태 로딩 중이거나 비로그인 상태(리다이렉트 중)일 때는 아무것도 렌더링하지 않음
  if (!isAuthLoaded || !isLoggedIn) {
    return null;
  }

  return (
    <FullPageModal isOpen={true} onClose={handleClose} title="키워드 알림">
      <KeywordsModalContent onUpdate={handleUpdate} />
    </FullPageModal>
  );
}
