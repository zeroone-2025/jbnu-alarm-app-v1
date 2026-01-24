import { getBoardName, getBoardColor, getColorClasses } from '@/_lib/constants/boards';

interface CategoryBadgeProps {
  boardCode: string; // category에서 boardCode로 변경
}

export default function CategoryBadge({ boardCode }: CategoryBadgeProps) {
  const color = getBoardColor(boardCode);
  const label = getBoardName(boardCode);
  const colorClasses = getColorClasses(color);

  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colorClasses.bg} ${colorClasses.text}`}
    >
      {label}
    </span>
  );
}
