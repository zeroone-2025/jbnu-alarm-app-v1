'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { FiXCircle } from 'react-icons/fi';

import Button from '@/_components/ui/Button';
import FullPageModal from '@/_components/layout/FullPageModal';
import { useToast } from '@/_context/ToastContext';
import { useSmartBack } from '@/_lib/hooks/useSmartBack';
import { useCreateTeam } from '@/_lib/hooks/useTeam';
import { getCategoryOptions } from '@/_lib/utils/teamDisplay';

export default function TeamCreateView() {
  const router = useRouter();
  const goBack = useSmartBack('/chinba/team');
  const createTeam = useCreateTeam();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = getCategoryOptions();
  const canSubmit = name.trim().length > 0 && !createTeam.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);

    try {
      const result = await createTeam.mutateAsync({
        name: name.trim(),
        category: category || undefined,
      });
      showToast('팀이 생성되었습니다', 'success');
      router.replace(`/chinba/team/detail?id=${result.id}`);
    } catch (err: any) {
      const detail = err.response?.data?.detail || '팀 생성에 실패했습니다';
      setError(detail);
      showToast(detail, 'error');
    }
  };

  return (
    <FullPageModal isOpen={true} onClose={goBack} title="팀 만들기">
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            팀 이름
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 코딩 동아리, 졸업 프로젝트"
              maxLength={50}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-900 transition-colors"
            />
            {name.length > 0 && (
              <button
                type="button"
                onClick={() => setName('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <FiXCircle size={18} />
              </button>
            )}
          </div>
          <p className="mt-1 text-[11px] text-gray-400 text-right">{name.length}/50</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            카테고리
            <span className="ml-1 text-xs font-normal text-gray-400">(선택)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCategory((prev) => (prev === opt.value ? '' : opt.value))}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors active:scale-95 ${
                  category === opt.value
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 py-3 pb-safe border-t border-gray-100">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {createTeam.isPending ? '만드는 중...' : '만들기'}
        </Button>
      </div>
    </FullPageModal>
  );
}
