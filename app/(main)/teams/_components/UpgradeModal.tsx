'use client';

import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: number;
  terminology?: 'team' | 'club';
}

const PREMIUM_FEATURES = [
  { label: '활동 기록 (뭐했니)', description: '조별 활동을 기록하고 공유' },
  { label: '조별 기록 비교 (잡아봐)', description: '조별 활동 데이터를 비교·분석·랭킹' },
];

const PRICING_DISPLAY = [
  { tier: 'Standard', members: '1~39명', price: '8,900원/월' },
  { tier: 'Pro', members: '40~79명', price: '17,900원/월' },
  { tier: 'Business', members: '80명+', price: '34,900원/월' },
];

export default function UpgradeModal({ isOpen, onClose, teamId, terminology = 'team' }: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-[85%] max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div className="text-center mb-5">
          <div className="mb-2 flex justify-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-xl">
              &#x2B50;
            </span>
          </div>
          <p className="text-base font-bold text-gray-900">프리미엄 기능입니다</p>
          <p className="mt-1 text-xs text-gray-500">
            구독하고 {terminology === 'club' ? '동아리' : '팀'} 관리 기능을 모두 이용하세요
          </p>
        </div>

        {/* Feature list */}
        <div className="mb-5 space-y-2.5">
          {PREMIUM_FEATURES.map((feature) => (
            <div key={feature.label} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                &#x2713;
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">{feature.label}</p>
                <p className="text-xs text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing preview */}
        <div className="mb-5 rounded-xl bg-gray-50 p-3">
          <p className="mb-2 text-xs font-semibold text-gray-500">
            요금제 (월 결제 기준)
          </p>
          <div className="flex justify-between text-xs text-gray-600">
            {PRICING_DISPLAY.map((item) => (
              <div key={item.tier} className="text-center">
                <p className="font-semibold text-gray-800">{item.tier}</p>
                <p className="font-medium text-gray-700">{item.price}</p>
                <p className="text-gray-400">{item.members}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
          >
            닫기
          </button>
          <button
            onClick={() => {
              onClose();
              router.push(`/chinba/team/settings?id=${teamId}`);
            }}
            className="flex-1 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-600 active:scale-95 transition-all"
          >
            구독하기
          </button>
        </div>
      </div>
    </div>
  );
}
