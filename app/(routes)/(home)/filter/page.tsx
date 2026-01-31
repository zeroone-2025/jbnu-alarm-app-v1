'use client';

import { useRouter } from 'next/navigation';
import { useSelectedCategories } from '@/_lib/hooks/useSelectedCategories';
import FullPageModal from '@/_components/layout/FullPageModal';
import BoardFilterContent from './_components/BoardFilterContent';

export default function FilterPage() {
    const router = useRouter();
    const { selectedCategories, updateSelectedCategories } = useSelectedCategories();

    const handleClose = () => {
        router.back();
    };

    const handleApply = async (boards: string[]) => {
        try {
            await updateSelectedCategories(boards);
            // 적용 후 홈으로 이동
            // back() 대신 replace('/')를 사용하여 히스토리 꼬임을 방지하고 확실하게 홈으로 보냄
            router.replace('/');
        } catch (error) {
            console.error('Failed to apply filters:', error);
            // 에러 시에도 일단 뒤로가기 시도하거나 알림 표시 가능
            router.back();
        }
    };

    return (
        <FullPageModal isOpen={true} onClose={handleClose} title="관심 게시판 설정">
            <BoardFilterContent
                selectedBoards={selectedCategories}
                onApply={handleApply}
                onClose={handleClose}
            />
        </FullPageModal>
    );
}
