'use client';

import FullPageModal from '@/_components/layout/FullPageModal';
import BoardFilterContent from './BoardFilterContent';

interface BoardFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBoards: string[];
  onApply: (boards: string[]) => void;
}

export default function BoardFilterModal({
  isOpen,
  onClose,
  selectedBoards,
  onApply,
}: BoardFilterModalProps) {
  return (
    <FullPageModal isOpen={isOpen} onClose={onClose} title="관심 게시판 설정">
      <BoardFilterContent selectedBoards={selectedBoards} onApply={onApply} onClose={onClose} />
    </FullPageModal>
  );
}
