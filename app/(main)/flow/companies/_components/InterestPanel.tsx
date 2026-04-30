'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronUp, FiLogIn, FiX } from 'react-icons/fi';

import { useUpsertCompanyInterest } from '@/_lib/hooks/useCompanies';
import { useUser } from '@/_lib/hooks/useUser';
import { useToast } from '@/_context/ToastContext';
import type { CompanyDetail } from '@/_types/flow';

interface Props {
  company: CompanyDetail;
}

type Choice = 'yes' | 'no' | null;

/** 평소엔 하단에 슬림 바, 탭하면 백드롭 + bottom sheet 펼침. 비로그인 시 로그인 유도. */
export default function InterestPanel({ company }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const upsert = useUpsertCompanyInterest(company.id);
  const { isLoggedIn, isAuthLoaded } = useUser();

  const initialChoice: Choice = company.my_interest
    ? company.my_interest.is_interested
      ? 'yes'
      : 'no'
    : null;

  const [choice, setChoice] = useState<Choice>(initialChoice);
  const [reason, setReason] = useState(company.my_interest?.reason ?? '');
  const [open, setOpen] = useState(false);

  // 서버 데이터가 마운트 후 도착할 때 동기화
  useEffect(() => {
    if (company.my_interest) {
      setChoice(company.my_interest.is_interested ? 'yes' : 'no');
      setReason(company.my_interest.reason ?? '');
    }
  }, [company.my_interest]);

  // 시트 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleSubmit = () => {
    if (!choice) {
      showToast('YES 또는 NO를 선택해 주세요', 'info');
      return;
    }
    upsert.mutate(
      { is_interested: choice === 'yes', reason: reason.trim() || null },
      {
        onSuccess: () => {
          showToast('관심 표현을 저장했어요', 'success');
          setOpen(false);
        },
        onError: () => showToast('저장에 실패했어요', 'error'),
      },
    );
  };

  // 슬림 바 텍스트 + 액션 분기 (비로그인 / 로그인 응답 상태별)
  // 인증 로딩 중에는 비로그인 모드로 깜빡이지 않도록 차분한 기본값
  const isGuestMode = isAuthLoaded && !isLoggedIn;

  const barText = isGuestMode
    ? '🔒 로그인하고 관심 표현하기'
    : initialChoice === 'yes'
      ? '✅ 관심 표현했어요'
      : initialChoice === 'no'
        ? '🤔 아직은 관심 없음'
        : '❓ 이 회사 어떠세요?';
  const barAction = isGuestMode ? '로그인' : initialChoice ? '수정' : '관심표현';
  const BarIcon = isGuestMode ? FiLogIn : FiChevronUp;

  const handleBarClick = () => {
    if (isGuestMode) {
      // 로그인 후 같은 회사 페이지로 돌아오게
      const redirect = `/flow/companies/?id=${company.id}`;
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      {/* Floating pill — 좌우 길쭉한 원, 살짝 떠 있는 그림자 */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={handleBarClick}
          className="flex w-full items-center justify-between gap-3 rounded-full bg-white px-5 py-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5 transition active:scale-[0.98]"
        >
          <span className="truncate text-sm font-medium text-gray-700">{barText}</span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600">
            {barAction} <BarIcon size={14} />
          </span>
        </button>
      </div>

      {/* 백드롭 + 시트 */}
      {open && (
        <>
          <div
            className="absolute inset-0 z-40 bg-black/40 animate-fadeIn"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white shadow-2xl pb-safe animate-slideUp">
            {/* Handle */}
            <div className="flex flex-col items-center pt-2.5 pb-1">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <p className="text-base font-semibold text-gray-900">
                이 회사 관심 있으신가요?
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* YES / NO */}
            <div className="px-5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setChoice('yes')}
                  aria-pressed={choice === 'yes'}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 py-4 transition ${
                    choice === 'yes'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl leading-none">⭕</span>
                  <span className="mt-1.5 text-sm font-semibold">관심 있어요</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChoice('no')}
                  aria-pressed={choice === 'no'}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 py-4 transition ${
                    choice === 'no'
                      ? 'border-gray-500 bg-gray-100 text-gray-800'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl leading-none">❌</span>
                  <span className="mt-1.5 text-sm font-semibold">아직은</span>
                </button>
              </div>
            </div>

            {/* 이유 입력 */}
            <div className="px-5 pt-4">
              <label className="text-xs font-medium text-gray-500">
                이유 (선택)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="관심 이유를 적어주세요..."
                rows={2}
                maxLength={500}
                className="mt-1.5 block w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm leading-relaxed focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 저장 */}
            <div className="px-5 pt-4 pb-5">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={upsert.isPending || !choice}
                className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600"
              >
                {upsert.isPending ? '저장 중…' : '저장'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
