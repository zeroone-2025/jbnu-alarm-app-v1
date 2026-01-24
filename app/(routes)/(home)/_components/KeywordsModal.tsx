'use client';

import FullPageModal from '@/_components/layout/FullPageModal';
import KeywordsModalContent from './KeywordsModalContent';

interface KeywordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function KeywordsModal({
  isOpen,
  onClose,
  onUpdate,
}: KeywordsModalProps) {
  return (
    <FullPageModal isOpen={isOpen} onClose={onClose} title="키워드 알림">
      <KeywordsModalContent onUpdate={onUpdate} />
    </FullPageModal>
  );
}
