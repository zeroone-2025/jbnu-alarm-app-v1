'use client';

import { FiMail, FiPhone, FiUser } from 'react-icons/fi';
import type { CareerProfile } from '@/_types/career';
import SectionCard from './SectionCard';

interface Props {
  profile: CareerProfile | null;
  onEdit?: () => void;
}

export default function ContactCard({ profile, onEdit }: Props) {
  const empty = !profile?.name && !profile?.email && !profile?.phone;

  return (
    <SectionCard
      emoji="📇"
      title="연락 정보"
      onEdit={onEdit}
      empty={empty}
      emptyText="이력에 표시할 이름·이메일·연락처를 등록해보세요"
    >
      <ul className="space-y-2 text-sm">
        {profile?.name && (
          <li className="flex items-center gap-2 text-gray-700">
            <FiUser size={14} className="text-gray-400" />
            {profile.name}
          </li>
        )}
        {profile?.email && (
          <li className="flex items-center gap-2 text-gray-700">
            <FiMail size={14} className="text-gray-400" />
            <span className="truncate">{profile.email}</span>
          </li>
        )}
        {profile?.phone && (
          <li className="flex items-center gap-2 text-gray-700">
            <FiPhone size={14} className="text-gray-400" />
            {profile.phone}
          </li>
        )}
      </ul>
    </SectionCard>
  );
}
