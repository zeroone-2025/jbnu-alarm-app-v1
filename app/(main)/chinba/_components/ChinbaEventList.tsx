'use client';

import { useState } from 'react';
import { useDeleteChinbaEvent } from '@/_lib/hooks/useChinba';
import { useUser } from '@/_lib/hooks/useUser';
import { ChinbaEventListItem } from './ChinbaEventListItem';
import ConfirmModal from '@/_components/ui/ConfirmModal';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import type { ChinbaEventListItem as ChinbaEventType } from '@/_types/chinba';

interface ChinbaEventListProps {
    events: ChinbaEventType[] | undefined;
    isLoading: boolean;
    onEventClick: (eventId: string) => void;
    onDeleteSuccess?: () => void;
    onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
    compact?: boolean;
    emptyMessage?: string;
    showTitle?: boolean;
    className?: string;
}

export function ChinbaEventList({
    events,
    isLoading,
    onEventClick,
    onDeleteSuccess,
    onShowToast,
    compact = false,
    emptyMessage = '참여한 방이 없습니다',
    showTitle = false,
    className = '',
}: ChinbaEventListProps) {
    const { user } = useUser();
    const deleteMutation = useDeleteChinbaEvent();
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; eventId: string | null; title: string }>({
        show: false,
        eventId: null,
        title: '',
    });

    const handleDeleteEvent = (eventId: string, title: string) => {
        setDeleteConfirm({ show: true, eventId, title });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm.eventId) return;

        try {
            await deleteMutation.mutateAsync(deleteConfirm.eventId);
            setDeleteConfirm({ show: false, eventId: null, title: '' });
            onDeleteSuccess?.();
            onShowToast?.('친바 일정이 삭제되었습니다', 'success');
        } catch (error) {
            onShowToast?.('삭제에 실패했습니다', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
            </div>
        );
    }

    if (!events || events.length === 0) {
        return <p className="text-xs text-gray-400 py-3 text-center">{emptyMessage}</p>;
    }

    return (
        <>
            <div className={className}>
                {showTitle && <h2 className="text-xs font-semibold text-gray-600 mb-2">내 친바 일정</h2>}

                {events.map((event) => (
                    <ChinbaEventListItem
                        key={event.event_id}
                        event={event}
                        compact={compact}
                        onClick={() => onEventClick(event.event_id)}
                        onDelete={
                            user && user.id === event.creator_id
                                ? () => handleDeleteEvent(event.event_id, event.title)
                                : undefined
                        }
                    />
                ))}
            </div>

            <ConfirmModal
                isOpen={deleteConfirm.show}
                title="친바 일정 삭제"
                confirmLabel="삭제"
                cancelLabel="취소"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteConfirm({ show: false, eventId: null, title: '' })}
                variant="danger"
            >
                <p>"{deleteConfirm.title}" 일정을 삭제하시겠습니까?</p>
                <p className="text-sm text-gray-500 mt-1">이 작업은 되돌릴 수 없습니다.</p>
            </ConfirmModal>
        </>
    );
}
