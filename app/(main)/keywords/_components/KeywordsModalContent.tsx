import { useState, useEffect } from 'react';
import axios from 'axios';
import { addKeyword, deleteKeyword, getMyKeywords, updateKeywordBoards, Keyword } from '@/_lib/api';
import { useUser } from '@/_lib/hooks/useUser';
import { useSelectedCategories } from '@/_lib/hooks/useSelectedCategories';
import { BOARD_MAP } from '@/_lib/constants/boards';
import Toast from '@/_components/ui/Toast';
import Button from '@/_components/ui/Button';
import GoogleLoginButton from '@/_components/auth/GoogleLoginButton';
import KeywordBoardSelector from './KeywordBoardSelector';
import { FiTrash2, FiSliders } from 'react-icons/fi';

interface KeywordsModalContentProps {
  onUpdate?: () => void;
}

function formatBoardCodes(boardCodes: string[] | null): string {
  if (!boardCodes || boardCodes.length === 0) return '구독 게시판 전체';
  const firstName = BOARD_MAP[boardCodes[0]]?.name ?? boardCodes[0];
  if (boardCodes.length === 1) return firstName;
  return `${firstName} 외 ${boardCodes.length - 1}개`;
}

export default function KeywordsModalContent({ onUpdate }: KeywordsModalContentProps) {
  const { isLoggedIn } = useUser();
  const { selectedCategories } = useSelectedCategories();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [showToast, setShowToast] = useState(false);
  const [toastKey, setToastKey] = useState(0);

  // 게시판 선택 상태
  const [addBoardCodes, setAddBoardCodes] = useState<string[] | null>(null);
  const [showAddBoardSelector, setShowAddBoardSelector] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [showEditBoardSelector, setShowEditBoardSelector] = useState(false);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastKey(prev => prev + 1);
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
    if (trimmed.length < 2) {
      showToastMessage('키워드는 2글자 이상 입력해 주세요.', 'info');
      return;
    }
    if (!isLoggedIn) {
      showToastMessage('로그인 후 사용할 수 있습니다.', 'info');
      return;
    }

    try {
      const created = await addKeyword(trimmed, addBoardCodes ?? undefined);
      setKeywords((prev) => [created, ...prev]);
      setKeywordInput('');
      setAddBoardCodes(null);
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

  const handleDeleteKeyword = async (e: React.MouseEvent, keywordId: number) => {
    e.stopPropagation();
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

  const handleEditBoards = (keyword: Keyword) => {
    setEditingKeyword(keyword);
    setShowEditBoardSelector(true);
  };

  const handleUpdateBoards = async (boardCodes: string[] | null) => {
    if (!editingKeyword) return;
    try {
      const result = await updateKeywordBoards(editingKeyword.id, boardCodes);
      setKeywords(prev => prev.map(k =>
        k.id === editingKeyword.id ? { ...k, board_codes: result.board_codes } : k
      ));
      setShowEditBoardSelector(false);
      setEditingKeyword(null);
      showToastMessage('게시판 범위가 수정되었습니다.', 'success');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update keyword boards', error);
      showToastMessage('게시판 범위 수정에 실패했습니다.', 'error');
    }
  };

  const handleAddBoardApply = (boardCodes: string[] | null) => {
    setAddBoardCodes(boardCodes);
    setShowAddBoardSelector(false);
  };

  // 게시판 선택 UI 표시 중이면 해당 컴포넌트 렌더링
  if (showAddBoardSelector) {
    return (
      <KeywordBoardSelector
        subscribedBoardCodes={selectedCategories}
        selectedBoardCodes={addBoardCodes}
        onApply={handleAddBoardApply}
        onClose={() => setShowAddBoardSelector(false)}
      />
    );
  }

  if (showEditBoardSelector && editingKeyword) {
    return (
      <KeywordBoardSelector
        subscribedBoardCodes={selectedCategories}
        selectedBoardCodes={editingKeyword.board_codes}
        onApply={handleUpdateBoards}
        onClose={() => {
          setShowEditBoardSelector(false);
          setEditingKeyword(null);
        }}
      />
    );
  }

  return (
    <>
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
        triggerKey={toastKey}
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
                  placeholder="키워드 입력 (예: 공모전, 장학금)"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddKeyword();
                  }}
                />
                <Button variant="primary" size="sm" onClick={handleAddKeyword}>
                  추가
                </Button>
              </div>

              {/* 게시판 범위 선택 */}
              <button
                onClick={() => setShowAddBoardSelector(true)}
                className="mt-3 flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
              >
                <FiSliders size={14} className="shrink-0 text-gray-400" />
                <span className={`flex-1 text-sm ${addBoardCodes ? 'font-medium text-blue-600' : 'text-gray-400'}`}>
                  {formatBoardCodes(addBoardCodes)}
                </span>
              </button>
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
                      <div key={idx} className="h-14 animate-pulse rounded-lg bg-gray-100" />
                    ))}
                  </div>
                ) : keywords.length > 0 ? (
                  <ul className="space-y-2">
                    {keywords.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => handleEditBoards(item)}
                        className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-2.5 shadow-sm transition-colors hover:bg-gray-50"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-gray-800">{item.keyword}</span>
                          <p className={`mt-0.5 truncate text-xs ${item.board_codes ? 'text-blue-500' : 'text-gray-400'}`}>
                            {formatBoardCodes(item.board_codes)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteKeyword(e, item.id)}
                          className="ml-2 shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-red-500"
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
