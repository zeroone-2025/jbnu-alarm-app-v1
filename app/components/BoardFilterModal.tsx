'use client';

import { useState, useEffect } from 'react';
import { FiX, FiInfo, FiRotateCcw } from 'react-icons/fi';
import { BOARD_LIST, CATEGORY_ORDER, BoardCategory } from '@/constants/boards';
import { isUserLoggedIn } from '@/lib/auth';

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
  const [tempSelection, setTempSelection] = useState<Set<string>>(new Set());
  const isLoggedIn = isUserLoggedIn();
  const isGuest = !isLoggedIn;
  const isFixedGuestBoard = (boardId: string) => isGuest && boardId === 'home_campus';

  // 모달이 열릴 때 선택 상태 초기화
  useEffect(() => {
    if (isOpen) {
      const initial = isGuest ? [...selectedBoards, 'home_campus'] : selectedBoards;
      setTempSelection(new Set(initial));
    }
  }, [isOpen, selectedBoards, isGuest]);

  if (!isOpen) return null;

  // 선택된 게시판과 미선택 게시판 분리
  const selectedItems = BOARD_LIST.filter((board) => tempSelection.has(board.id));
  const unselectedItems = BOARD_LIST.filter((board) => !tempSelection.has(board.id));

  // 카테고리별로 미선택 게시판 그룹화
  const groupedUnselected: Record<BoardCategory, typeof BOARD_LIST> = {
    '전북대': [],
    '단과대': [],
    '학과': [],
    '사업단': [],
  };

  unselectedItems.forEach((board) => {
    groupedUnselected[board.category].push(board);
  });

  // 선택/해제 토글
  const toggleBoard = (boardId: string) => {
    if (isFixedGuestBoard(boardId)) return;
    setTempSelection((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(boardId)) {
        newSet.delete(boardId);
      } else {
        newSet.add(boardId);
      }
      return newSet;
    });
  };

  // 초기화하기
  const handleReset = () => {
    if (isGuest) {
      // 게스트는 home_campus만 선택
      setTempSelection(new Set(['home_campus']));
    } else {
      // 로그인 사용자는 모두 해제
      setTempSelection(new Set());
    }
  };

  // 적용하기
  const handleApply = () => {
    const applied = isGuest
      ? Array.from(new Set([...tempSelection, 'home_campus']))
      : Array.from(tempSelection);
    onApply(applied);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 flex h-[80vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">관심 게시판 설정</h2>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="초기화"
            >
              <FiRotateCcw size={16} />
              <span>초기화</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="닫기"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Zone A: 선택된 게시판 */}
          <div className="border-b border-gray-100 bg-blue-50/50 p-4">
            <h3 className="mb-3 text-xs font-bold text-gray-500">선택된 게시판</h3>
            {selectedItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">
                보고 싶은 게시판을 선택해주세요
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedItems.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => toggleBoard(board.id)}
                    disabled={isFixedGuestBoard(board.id)}
                    className={`rounded-full border-2 border-gray-900 bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-md transition-all ${
                      isFixedGuestBoard(board.id)
                        ? 'cursor-not-allowed opacity-60'
                        : 'hover:bg-gray-50 active:scale-95'
                    }`}
                  >
                    {board.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zone B: 전체 목록 (세로 정렬, 가로로 쌓임) */}
          <div className="p-4">
            <h3 className="mb-3 text-xs font-bold text-gray-500">전체 목록</h3>
            <div className="flex flex-col gap-6">
              {CATEGORY_ORDER.map((category) => {
                const unselectedBoards = groupedUnselected[category];
                const allBoardsInCategory = BOARD_LIST.filter(b => b.category === category);

                return (
                  <div key={category}>
                    {/* 카테고리 제목 */}
                    <h4 className="mb-3 text-xs font-bold text-gray-400">{category}</h4>

                    {/* 게시판 칩 목록 또는 빈 공간 */}
                    {unselectedBoards.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {unselectedBoards.map((board) => (
                          <button
                            key={board.id}
                            onClick={() => toggleBoard(board.id)}
                            disabled={isFixedGuestBoard(board.id)}
                            className={`rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all ${
                              isFixedGuestBoard(board.id)
                                ? 'cursor-not-allowed opacity-60'
                                : 'hover:bg-gray-100 active:scale-95'
                            }`}
                          >
                            {board.name}
                          </button>
                        ))}
                      </div>
                    ) : allBoardsInCategory.length > 0 ? (
                      <div className="h-3"></div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100">
          {/* Guest 안내 문구 */}
          {!isLoggedIn && (
            <div className="flex items-start gap-2 bg-blue-50 px-6 py-3">
              <FiInfo className="mt-0.5 shrink-0 text-blue-600" size={16} />
              <p className="text-xs text-gray-600">
                로그인하지 않으면 설정이 다른 기기에서 저장되지 않습니다.
              </p>
            </div>
          )}

          {/* 버튼 영역 */}
          <div className="flex gap-3 px-6 py-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleApply}
              className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              적용하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
