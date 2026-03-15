'use client';

import { useUser } from '@/_lib/hooks/useUser';
import FullPageModal from '@/_components/layout/FullPageModal';
import KeywordsModalContent from './_components/KeywordsModalContent';
import Button from '@/_components/ui/Button';
import { useRouter } from 'next/navigation'; // Added missing import for useRouter
import { useEffect } from 'react'; // Added missing import for useEffect
import { useSmartBack } from '@/_lib/hooks/useSmartBack';
import { useNotificationBadge } from '@/_context/NotificationBadgeContext';

/**
 * 키워드 관리 페이지
 * - 키워드 추가/삭제
 * - FullPageModal을 사용한 전체 화면 UI
 */
export default function KeywordsPage() {
  const router = useRouter();
  const smartBack = useSmartBack();
  const { isLoggedIn, isAuthLoaded } = useUser();
  const { refreshKeywordNotices } = useNotificationBadge();

  useEffect(() => {
    if (isAuthLoaded && !isLoggedIn) {
      router.replace('/');
    }
  }, [isAuthLoaded, isLoggedIn, router]);

  const handleClose = () => {
    smartBack();
  };

  const handleUpdate = () => {
    refreshKeywordNotices();
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
