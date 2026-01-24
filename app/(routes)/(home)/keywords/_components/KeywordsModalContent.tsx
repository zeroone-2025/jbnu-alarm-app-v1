import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthState } from '@/_lib/hooks/useAuthState';
import { addKeyword, deleteKeyword, getMyKeywords, Keyword } from '@/_lib/api';
import Toast from '@/_components/ui/Toast';
import Button from '@/_components/ui/Button';
import GoogleLoginButton from '@/_components/auth/GoogleLoginButton';
import { FiTrash2 } from 'react-icons/fi';

interface KeywordsModalContentProps {
  onUpdate?: () => void;
}

export default function KeywordsModalContent({ onUpdate }: KeywordsModalContentProps) {
  const { isLoggedIn } = useAuthState();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [showToast, setShowToast] = useState(false);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const loadKeywords = async () => {
    setKeywordsLoading(true);
    try {
      const data = await getMyKeywords();
      setKeywords(data);
    } catch (error) {
      console.error('Failed to load keywords', error);
      showToastMessage('키워드 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setKeywordsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadKeywords();
    }
  }, [isLoggedIn]);

  const handleAddKeyword = async () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) {
      showToastMessage('키워드를 입력해 주세요.', 'info');
      return;
    }
    if (!isLoggedIn) {
      showToastMessage('로그인 후 사용할 수 있습니다.', 'info');
      return;
    }

    try {
      const created = await addKeyword(trimmed);
      setKeywords((prev) => [created, ...prev]);
      setKeywordInput('');
      showToastMessage('키워드가 추가되었습니다.', 'success');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to add keyword', error);
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        if (detail === '이미 등록된 키워드입니다.') {
          showToastMessage('이미 등록된 키워드입니다.', 'info');
          return;
        }
      }
      showToastMessage('키워드 추가에 실패했습니다.', 'error');
    }
  };

  const handleDeleteKeyword = async (keywordId: number) => {
    try {
      await deleteKeyword(keywordId);
      setKeywords((prev) => prev.filter((item) => item.id !== keywordId));
      showToastMessage('키워드가 삭제되었습니다.', 'success');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to delete keyword', error);
      showToastMessage('키워드 삭제에 실패했습니다.', 'error');
    }
  };

  return (
    <>
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />

      {!isLoggedIn ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
          <GoogleLoginButton />
          <p className="mt-4 text-sm text-gray-600">
            로그인하면 키워드를 저장하고 알림을 받을 수 있어요.
          </p>
          
        </div>
      ) : (
        <div className="flex h-full flex-col p-5">
          <section className="flex h-full flex-col">
            <div className="shrink-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <label className="text-sm font-semibold text-gray-700">키워드 추가</label>
              <div className="mt-3 flex gap-2">
                <input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="예) 공모전, 수강신청, 장학금 등"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddKeyword();
                  }}
                />
                <Button variant="primary" size="sm" onClick={handleAddKeyword}>
                  추가
                </Button>
              </div>
            </div>

            <div className="mt-6 flex min-h-0 flex-1 flex-col">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">내 키워드</h2>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {keywords.length}개
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {keywordsLoading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, idx) => (
                      <div key={idx} className="h-10 animate-pulse rounded-lg bg-gray-100" />
                    ))}
                  </div>
                ) : keywords.length > 0 ? (
                  <ul className="space-y-2">
                    {keywords.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-2.5 text-sm shadow-sm"
                      >
                        <span className="font-medium text-gray-800">{item.keyword}</span>
                        <button
                          onClick={() => handleDeleteKeyword(item.id)}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-red-500"
                          aria-label={`${item.keyword} 삭제`}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                    아직 등록된 키워드가 없어요.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
