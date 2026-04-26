'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiChevronDown, FiCopy, FiExternalLink, FiLock, FiShare2 } from 'react-icons/fi';

import { useToast } from '@/_context/ToastContext';
import { useSaveCareerContact } from '@/_lib/hooks/useCareer';
import type { CareerProfile, CareerVisibility } from '@/_types/career';
import type { UserProfile } from '@/_types/user';

interface Props {
  profile: CareerProfile | null;
  user: UserProfile | null;
  onEditProfile: () => void;
}

const OPTIONS: { value: CareerVisibility; label: string; description: string }[] = [
  {
    value: 'private',
    label: '비공개',
    description: '나만 볼 수 있어요',
  },
  {
    value: 'career_only',
    label: '이력 공개',
    description: '연락처는 숨겨요',
  },
  {
    value: 'public',
    label: '전체 공개',
    description: '연락처도 보여줘요',
  },
];

export default function PublicProfilePanel({ profile, user, onEditProfile }: Props) {
  const { showToast } = useToast();
  const save = useSaveCareerContact();
  const [isExpanded, setIsExpanded] = useState(false);
  const username = user?.username?.trim() ?? '';
  const visibility = profile?.visibility ?? 'private';
  const publicPath = username ? `/flow/profile?u=@${username}` : '';
  const publicUrl =
    typeof window !== 'undefined' && publicPath ? `${window.location.origin}${publicPath}` : publicPath;

  const updateVisibility = async (next: CareerVisibility) => {
    if (!username && next !== 'private') {
      showToast('@아이디를 먼저 설정해 주세요', 'info');
      return;
    }

    try {
      await save.mutateAsync({
        name: profile?.name ?? user?.nickname ?? null,
        email: profile?.email ?? user?.email ?? null,
        phone: profile?.phone ?? null,
        visibility: next,
      });
      showToast('공개 설정을 저장했어요', 'success');
    } catch {
      showToast('공개 설정 저장에 실패했어요', 'error');
    }
  };

  const copyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      showToast('공개 프로필 링크를 복사했어요', 'success');
    } catch {
      showToast('링크 복사에 실패했어요', 'error');
    }
  };

  const activeOption = OPTIONS.find((option) => option.value === visibility) ?? OPTIONS[0];
  const isPubliclyAccessible = visibility !== 'private' && Boolean(username);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <FiShare2 size={15} />
            공개 프로필
          </h2>
          <p className="mt-1 truncate text-xs text-gray-400">
            {isPubliclyAccessible ? publicPath : activeOption.description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              visibility === 'private'
                ? 'bg-gray-100 text-gray-500'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            {visibility === 'private' && <FiLock size={11} />}
            {activeOption.label}
          </span>
          <FiChevronDown
            size={16}
            className={`text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-1.5">
            {OPTIONS.map((option) => {
              const active = visibility === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateVisibility(option.value)}
                  disabled={save.isPending}
                  className={`min-h-[64px] rounded-xl border px-2 py-2 text-left transition-colors disabled:opacity-60 ${
                    active
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="block text-xs font-bold">{option.label}</span>
                  <span className={`mt-1 block text-[10px] leading-tight ${active ? 'text-white/70' : 'text-gray-400'}`}>
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>

          {!username ? (
            <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
              공개 링크를 만들려면 @아이디가 필요합니다.
              <button
                type="button"
                onClick={onEditProfile}
                className="ml-1 font-bold underline underline-offset-2"
              >
                설정하기
              </button>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <div className="min-w-0 flex-1 rounded-xl bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">
                <span className="block truncate">{publicPath}</span>
              </div>
              <button
                type="button"
                onClick={copyLink}
                disabled={visibility === 'private'}
                aria-label="공개 프로필 링크 복사"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 disabled:text-gray-300"
              >
                <FiCopy size={15} />
              </button>
              <Link
                href={publicPath}
                aria-label="공개 프로필 보기"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white transition-colors hover:bg-gray-800"
              >
                <FiExternalLink size={15} />
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
