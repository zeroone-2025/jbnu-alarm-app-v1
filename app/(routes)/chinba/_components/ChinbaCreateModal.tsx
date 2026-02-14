'use client';

import { useEffect, useState, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import Button from '@/_components/ui/Button';
import Toast from '@/_components/ui/Toast';
import LoginButtonGroup from '@/_components/auth/LoginButtonGroup';
import { useCreateChinbaEvent } from '@/_lib/hooks/useChinba';
import { useUser } from '@/_lib/hooks/useUser';
import DateSelector from '../create/_components/DateSelector';

interface ChinbaCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (eventId: string) => void;
}

export default function ChinbaCreateModal({ isOpen, onClose, onSuccess }: ChinbaCreateModalProps) {
    const createEvent = useCreateChinbaEvent();
    const { isLoggedIn } = useUser();

    const draftKey = 'chinba:create:draft';
    const [title, setTitle] = useState('');
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVisible, setToastVisible] = useState(false);
    const [toastKey, setToastKey] = useState(0);
    const loginPromptRef = useRef<HTMLDivElement>(null);

    const canSubmit = title.trim().length > 0 && selectedDates.length > 0 && !createEvent.isPending;

    useEffect(() => {
        if (!isOpen) return;
        try {
            const stored = localStorage.getItem(draftKey);
            if (!stored) return;
            const parsed = JSON.parse(stored) as { title?: string; selectedDates?: string[] };
            if (parsed.title) setTitle(parsed.title);
            if (Array.isArray(parsed.selectedDates)) setSelectedDates(parsed.selectedDates);
        } catch {
            // ignore localStorage errors
        }
    }, [isOpen, draftKey]);

    useEffect(() => {
        if (!isOpen) return;
        try {
            localStorage.setItem(draftKey, JSON.stringify({ title, selectedDates }));
        } catch {
            // ignore localStorage errors
        }
    }, [draftKey, title, selectedDates, isOpen]);

    // ESC key handler
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleSubmit = async () => {
        if (!canSubmit) return;
        if (!isLoggedIn) {
            setToastMessage('로그인이 필요합니다');
            setToastVisible(true);
            setToastKey(prev => prev + 1);
            setShowLoginPrompt(true);
            requestAnimationFrame(() => {
                loginPromptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            return;
        }
        setError(null);

        try {
            const result = await createEvent.mutateAsync({
                title: title.trim(),
                dates: selectedDates,
            });
            try {
                localStorage.removeItem(draftKey);
            } catch {
                // ignore localStorage errors
            }
            onSuccess(result.event_id);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || '이벤트 생성에 실패했습니다');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[100] bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">새 일정 만들기</h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="닫기"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-5 py-4">
                        {/* Error */}
                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {/* Title */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                모임 이름
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="예: 조별과제 회의, 동아리 정기모임"
                                maxLength={100}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-900 transition-colors"
                            />
                            <p className="mt-1 text-[11px] text-gray-400 text-right">{title.length}/100</p>
                        </div>

                        {/* Date Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                날짜 선택
                            </label>
                            <p className="text-xs text-gray-400 mb-3">
                                후보 날짜를 클릭하거나 드래그하여 선택하세요
                            </p>
                            <div className="rounded-xl border border-gray-200 p-4">
                                <DateSelector
                                    selectedDates={selectedDates}
                                    onChange={setSelectedDates}
                                />
                            </div>
                        </div>

                        {showLoginPrompt && (
                            <div ref={loginPromptRef} className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                                <p className="text-sm font-medium text-gray-800 text-center mb-1">
                                    만들려면 로그인이 필요합니다
                                </p>
                                <p className="text-xs text-gray-500 text-center mb-4">
                                    소셜 로그인으로 1초만에 가입하세요!
                                </p>
                                <LoginButtonGroup />
                                <button
                                    onClick={() => setShowLoginPrompt(false)}
                                    className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600"
                                >
                                    닫기
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 px-5 py-4 border-t border-gray-100">
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                        >
                            {createEvent.isPending ? '만드는 중...' : '만들기'}
                        </Button>
                    </div>
                </div>
            </div>

            <Toast
                message={toastMessage}
                isVisible={toastVisible}
                onClose={() => setToastVisible(false)}
                duration={2000}
                triggerKey={toastKey}
            />
        </>
    );
}
