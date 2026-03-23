'use client';

interface HighlightedTitleProps {
  title: string;
  query: string;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function HighlightedTitle({ title, query }: HighlightedTitleProps) {
  if (!query.trim()) {
    return <span>{title}</span>;
  }

  const regex = new RegExp(`(${escapeRegex(query.trim())})`, 'gi');
  const parts = title.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}
