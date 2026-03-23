'use client';

import { useState, useRef } from 'react';
import { FiRotateCcw, FiSearch, FiX } from 'react-icons/fi';
import { BOARD_MAP, CATEGORY_ORDER, BoardCategory } from '@/_lib/constants/boards';
import Button from '@/_components/ui/Button';

interface KeywordBoardSelectorProps {
    subscribedBoardCodes: string[];
    selectedBoardCodes: string[] | null;
    onApply: (boardCodes: string[] | null) => void;
    onClose: () => void;
}

const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

const normalizeSearchText = (text: string) => text.toLowerCase().replace(/\s+/g, '');

const getChoseong = (text: string) => {
    let result = '';
    for (const char of text) {
        const code = char.charCodeAt(0);
        if (code < 0xac00 || code > 0xd7a3) {
            result += char;
            continue;
        }
        const index = Math.floor((code - 0xac00) / 588);
        result += CHOSEONG[index] || '';
    }
    return result;
};

export default function KeywordBoardSelector({
    subscribedBoardCodes,
    selectedBoardCodes,
    onApply,
    onClose,
}: KeywordBoardSelectorProps) {
    const [tempSelection, setTempSelection] = useState<Set<string>>(
        new Set(selectedBoardCodes ?? [])
    );
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const normalizedQuery = normalizeSearchText(searchQuery);

    const matchesSearch = (boardCode: string) => {
        if (!normalizedQuery) return true;
        const meta = BOARD_MAP[boardCode];
        if (!meta) return false;
        const name = normalizeSearchText(meta.name);
        const id = normalizeSearchText(boardCode);
        const category = normalizeSearchText(meta.category);
        const choseong = normalizeSearchText(getChoseong(meta.name));
        return (
            name.includes(normalizedQuery) ||
            id.includes(normalizedQuery) ||
            category.includes(normalizedQuery) ||
            choseong.includes(normalizedQuery)
        );
    };

    const toggleBoard = (boardCode: string) => {
        setTempSelection((prev) => {
            const next = new Set(prev);
            if (next.has(boardCode)) {
                next.delete(boardCode);
            } else {
                next.add(boardCode);
            }
            return next;
        });
    };

    const handleReset = () => {
        setTempSelection(new Set());
    };

    // 선택된 게시판 칩 (검색 무관하게 항상 표시)
    const selectedItems = subscribedBoardCodes.filter((code) => tempSelection.has(code));

    // 미선택 게시판 (검색 적용)
    const unselectedItems = subscribedBoardCodes.filter(
        (code) => !tempSelection.has(code) && matchesSearch(code)
    );

    // 카테고리별 그룹화
    const groupedUnselected: Record<BoardCategory, string[]> = {
        전북대: [],
        단과대: [],
        학과: [],
        사업단: [],
    };

    unselectedItems.forEach((code) => {
        const meta = BOARD_MAP[code];
        if (meta) {
            groupedUnselected[meta.category].push(code);
        }
    });

    return (
        <div className="flex h-full flex-col">
            {/* 헤더 */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
                <h2 className="text-base font-bold text-gray-800">알림 받을 게시판</h2>
                <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label="닫기"
                >
                    <FiX size={20} />
                </button>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {/* 선택된 게시판 영역 */}
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
                            알림 받을 게시판을 선택해주세요
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {selectedItems.map((code) => (
                                <button
                                    key={code}
                                    onClick={() => toggleBoard(code)}
                                    className="rounded-full border-2 border-gray-900 bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-md transition-all hover:bg-gray-50 active:scale-95"
                                >
                                    {BOARD_MAP[code]?.name ?? code}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 게시판 목록 */}
                <div className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="text-xs font-bold text-gray-500">구독 게시판</h3>
                        <div className="relative w-[140px]">
                            <input
                                ref={searchInputRef}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="게시판 검색"
                                className="h-8 w-full rounded-lg border border-gray-200 bg-white px-3 pr-14 text-xs outline-none transition-colors focus:border-blue-400"
                            />
                            {searchQuery.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        searchInputRef.current?.focus();
                                    }}
                                    className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                    aria-label="검색어 지우기"
                                >
                                    <FiX size={12} />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => searchInputRef.current?.focus()}
                                className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                aria-label="게시판 검색"
                            >
                                <FiSearch size={13} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {CATEGORY_ORDER.map((category) => {
                            const boards = groupedUnselected[category];
                            if (boards.length === 0) return null;
                            return (
                                <div key={category}>
                                    <h4 className="mb-3 text-xs font-bold text-gray-400">{category}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {boards.map((code) => (
                                            <button
                                                key={code}
                                                onClick={() => toggleBoard(code)}
                                                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 active:scale-95"
                                            >
                                                {BOARD_MAP[code]?.name ?? code}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {unselectedItems.length === 0 && normalizedQuery && (
                            <p className="py-6 text-center text-sm text-gray-400">
                                검색 결과가 없습니다.
                            </p>
                        )}
                        {subscribedBoardCodes.length === 0 && (
                            <p className="py-6 text-center text-sm text-gray-400">
                                구독 중인 게시판이 없습니다.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-gray-100">
                <div className="flex gap-3 px-5 py-4 pb-safe">
                    <Button variant="outline" fullWidth onClick={() => onApply(null)}>
                        구독 게시판 전체
                    </Button>
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={() => onApply(tempSelection.size > 0 ? Array.from(tempSelection) : null)}
                    >
                        적용
                    </Button>
                </div>
            </div>
        </div>
    );
}
