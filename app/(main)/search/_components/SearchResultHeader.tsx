'use client';

interface SearchResultHeaderProps {
  totalCount: number;
}

export default function SearchResultHeader({ totalCount }: SearchResultHeaderProps) {
  return (
    <div className="px-4 py-2">
      <span className="text-sm text-gray-500">
        검색 결과 <span className="font-semibold text-gray-700">{totalCount.toLocaleString()}</span>건
      </span>
    </div>
  );
}
