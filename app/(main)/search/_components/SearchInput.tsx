'use client';

import { useEffect, useRef } from 'react';

import { FiSearch, FiX } from 'react-icons/fi';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export default function SearchInput({ value, onChange, onSubmit }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit(value);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex items-center px-4 py-2">
      <div className="relative flex w-full items-center rounded-xl bg-gray-100 px-3 py-2.5">
        <FiSearch size={18} className="shrink-0 text-gray-400" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="검색어를 입력하세요"
          enterKeyHint="search"
          className="ml-2 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 shrink-0 rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            aria-label="검색어 지우기"
          >
            <FiX size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
