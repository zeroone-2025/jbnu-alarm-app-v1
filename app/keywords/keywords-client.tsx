'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import {
  addKeyword,
  deleteKeyword,
  getGoogleLoginUrl,
  getMyKeywords,
  Keyword,
} from '@/api';
import Toast from '@/components/Toast';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';

export default function KeywordsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
    const token = localStorage.getItem('accessToken');
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      loadKeywords();
    }
  }, []);

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

      <main className="h-full overflow-hidden bg-gray-50">
        <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden border-x border-gray-100 bg-white shadow-xl transition-all md:max-w-4xl">
          <div className="shrink-0 border-b border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const returnTo = searchParams.get('returnTo');
                  if (returnTo) {
                    router.push(returnTo);
                    return;
                  }
                  router.back();
                }}
                className="rounded-full p-2 text-gray-600 transition-all hover:bg-gray-100"
                aria-label="홈으로 돌아가기"
              >
                <FiArrowLeft size={20} />
              </button>
              <h1 className="text-lg font-bold text-gray-800">키워드 알림</h1>
              <div className="w-10" />
            </div>
          </div>

          {!isLoggedIn ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <p className="text-sm text-gray-600">로그인하면 키워드를 저장하고 알림을 받을 수 있어요.</p>
              <button
                onClick={() => (window.location.href = getGoogleLoginUrl())}
                className="mt-4 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Google 계정으로 로그인
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden p-5">
              <section className="flex h-full flex-col">
                <div className="shrink-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <label className="text-sm font-semibold text-gray-700">키워드 추가</label>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="예) 공모전, 수강신청, 장학금 등"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    />
                    <button
                      onClick={handleAddKeyword}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      추가
                    </button>
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
        </div>
      </main>
    </>
  );
}
