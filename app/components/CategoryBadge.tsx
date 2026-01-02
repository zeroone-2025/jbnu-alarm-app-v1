import { getCategoryColor, getCategoryLabel } from '@/lib/categories';

interface CategoryBadgeProps {
  category: string;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const color = getCategoryColor(category);
  const label = getCategoryLabel(category);

  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${color.bg} ${color.text}`}
    >
      {label}
    </span>
  );
}
