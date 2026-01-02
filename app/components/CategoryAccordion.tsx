'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { CategoryGroup } from '@/lib/categories';
import CategoryBadge from './CategoryBadge';

interface CategoryAccordionProps {
  group: CategoryGroup;
  selectedCategories: string[];
  onToggle: (categoryId: string) => void;
}

export default function CategoryAccordion({
  group,
  selectedCategories,
  onToggle,
}: CategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const hasChildren = group.children.length > 0;

  return (
    <div className="border-b border-gray-100">
      {/* Accordion 헤더 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between bg-white px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <FiChevronDown className="text-gray-400" size={20} />
          ) : (
            <FiChevronRight className="text-gray-400" size={20} />
          )}
          <span className="font-semibold text-gray-800">{group.label}</span>
          {hasChildren && (
            <span className="text-xs text-gray-400">
              ({group.children.length})
            </span>
          )}
        </div>
      </button>

      {/* Accordion 내용 */}
      {isOpen && (
        <div className="bg-gray-50 px-5 py-3">
          {hasChildren ? (
            <div className="space-y-2">
              {group.children.map((item) => {
                const isSelected = selectedCategories.includes(item.id);
                const isDisabled = !item.available;

                return (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 rounded-lg bg-white p-3 transition-all ${
                      isDisabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:bg-blue-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => !isDisabled && onToggle(item.id)}
                      disabled={isDisabled}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:cursor-not-allowed"
                    />
                    <CategoryBadge category={item.id} />
                    {isDisabled && (
                      <span className="ml-auto text-xs text-gray-400">
                        사용 불가
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          ) : (
            // 준비 중 메시지
            <div className="rounded-lg bg-white p-4 text-center">
              <p className="text-sm text-gray-400">준비 중입니다</p>
              <p className="mt-1 text-xs text-gray-300">
                곧 추가될 예정이에요
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
