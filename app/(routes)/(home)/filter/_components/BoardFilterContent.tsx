'use client';

import { useState, useEffect } from 'react';
import { FiInfo, FiRotateCcw } from 'react-icons/fi';
import { BOARD_LIST, CATEGORY_ORDER, BoardCategory } from '@/_lib/constants/boards';
import { useUser } from '@/_lib/hooks/useUser';
import Button from '@/_components/ui/Button';

interface BoardFilterContentProps {
  selectedBoards: string[];
  onApply: (boards: string[]) => void;
  onClose: () => void;
}

export default function BoardFilterContent({
  selectedBoards,
  onApply,
  onClose,
}: BoardFilterContentProps) {
  const [tempSelection, setTempSelection] = useState<Set<string>>(new Set());
  const { isLoggedIn, isAuthLoaded } = useUser(); // isAuthLoaded 추가
  const isGuest = !isLoggedIn;
  const isFixedGuestBoard = (boardId: string) => isGuest && boardId === 'home_campus';

  // 초기화
  useEffect(() => {
    // isAuthLoaded가 true가 될 때까지 기다립니다.
    if (!isAuthLoaded) return;

    const initial = isGuest ? [...selectedBoards, 'home_campus'] : selectedBoards;
    setTempSelection(new Set(initial));
  }, [selectedBoards, isGuest, isAuthLoaded]); // isAuthLoaded를 의존성 배열에 추가

  // 선택된 게시판과 미선택 게시판 분리
  const selectedItems = BOARD_LIST.filter((board) => tempSelection.has(board.id));
  const unselectedItems = BOARD_LIST.filter((board) => !tempSelection.has(board.id));

  // 카테고리별로 미선택 게시판 그룹화
  const groupedUnselected: Record<BoardCategory, typeof BOARD_LIST> = {
    전북대: [],
    단과대: [],
    학과: [],
    사업단: [],
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
      setTempSelection(new Set(['home_campus']));
    } else {
      setTempSelection(new Set());
    }
  };

  const handleApply = () => {
    const applied = isGuest
      ? Array.from(new Set([...tempSelection, 'home_campus']))
      : Array.from(tempSelection);
    onApply(applied);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Body - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Zone A: 선택된 게시판 */}
        <div className="border-b border-gray-100 bg-blue-50/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-500">선택된 게시판</h3>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="초기화"
            >
              <FiRotateCcw size={16} />
              <span>초기화</span>
            </button>
          </div>
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
                  className={`rounded-full border-2 border-gray-900 bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-md transition-all ${isFixedGuestBoard(board.id)
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

        {/* Zone B: 전체 목록 */}
        <div className="p-4">
          <h3 className="mb-3 text-xs font-bold text-gray-500">전체 목록</h3>
          <div className="flex flex-col gap-6">
            {CATEGORY_ORDER.map((category) => {
              const unselectedBoards = groupedUnselected[category];
              const allBoardsInCategory = BOARD_LIST.filter((b) => b.category === category);

              return (
                <div key={category}>
                  <h4 className="mb-3 text-xs font-bold text-gray-400">{category}</h4>
                  {unselectedBoards.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {unselectedBoards.map((board) => (
                        <button
                          key={board.id}
                          onClick={() => toggleBoard(board.id)}
                          disabled={isFixedGuestBoard(board.id)}
                          className={`rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all ${isFixedGuestBoard(board.id)
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
      <div className="shrink-0 border-t border-gray-100">
        {/* Guest 안내 문구 */}
        {!isLoggedIn && (
          <div className="flex items-start gap-2 bg-blue-50 px-5 py-3">
            <FiInfo className="mt-0.5 shrink-0 text-blue-600" size={16} />
            <p className="text-xs text-gray-600">
              로그인하지 않으면 설정이 다른 기기에서 저장되지 않습니다.
            </p>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="flex gap-3 px-5 py-4">
          <Button variant="outline" fullWidth onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" fullWidth onClick={handleApply}>
            적용하기
          </Button>
        </div>
      </div>
    </div>
  );
}
