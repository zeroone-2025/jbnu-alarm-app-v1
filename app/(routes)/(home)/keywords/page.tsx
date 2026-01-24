'use client';

import { useRouter } from 'next/navigation';
import { useAuthState } from '@/_lib/hooks/useAuthState';
import FullPageModal from '@/_components/layout/FullPageModal';
import KeywordsModalContent from '../_components/KeywordsModalContent';
import Button from '@/_components/ui/Button';

/**
 * 키워드 관리 페이지
 * - 키워드 추가/삭제
 * - FullPageModal을 사용한 전체 화면 UI
 */
export default function KeywordsPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthState();

  const handleClose = () => {
    router.push('/');
  };

  const handleUpdate = () => {
    // 키워드 업데이트 완료
    // 페이지는 그대로 유지 (사용자가 뒤로가기로 이동)
  };

  // 비로그인 상태
  if (!isLoggedIn) {
    return (
      <FullPageModal isOpen={true} onClose={handleClose} title="키워드 알림">
        <div className="flex h-full flex-col items-center justify-center px-5 pb-20">
          <Button variant="primary" onClick={handleClose}>
            홈으로 돌아가기
          </Button>
          <p className="mt-4 text-center text-gray-600">
            로그인 후 키워드 알림을 사용할 수 있습니다.
          </p>
        </div>
      </FullPageModal>
    );
  }

  return (
    <FullPageModal isOpen={true} onClose={handleClose} title="키워드 알림">
      <KeywordsModalContent onUpdate={handleUpdate} />
    </FullPageModal>
  );
}
