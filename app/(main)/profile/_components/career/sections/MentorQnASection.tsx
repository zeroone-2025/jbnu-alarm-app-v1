'use client';

import { useState, useEffect } from 'react';

import { FiEdit3 } from 'react-icons/fi';

import { useSaveCareerMentorQnA } from '@/_lib/hooks/useCareer';
import type { CareerProfile, MentorQnA } from '@/_types/career';

interface MentorQnASectionProps {
  profile: CareerProfile | null;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaveSuccess: () => void;
  isEmpty: boolean;
}

export default function MentorQnASection({
  profile,
  isEditing,
  onEdit,
  onCancel,
  onSaveSuccess,
  isEmpty,
}: MentorQnASectionProps) {
  const saveMutation = useSaveCareerMentorQnA();
  const [mentorQnA, setMentorQnA] = useState<MentorQnA>({
    targeted_capital: null,
    reason_for_local: null,
    helpful_organizations: null,
    local_advantages: null,
    local_disadvantages: null,
    advice_for_juniors: null,
  });

  useEffect(() => {
    if (profile?.mentor_qna) {
      setMentorQnA(profile.mentor_qna);
    } else {
      setMentorQnA({
        targeted_capital: null,
        reason_for_local: null,
        helpful_organizations: null,
        local_advantages: null,
        local_disadvantages: null,
        advice_for_juniors: null,
      });
    }
  }, [profile]);

  const handleSubmit = async () => {
    try {
      await saveMutation.mutateAsync({ mentor_qna: mentorQnA });
      onSaveSuccess();
    } catch (error) {
      console.error('멘토 Q&A 저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    if (profile?.mentor_qna) {
      setMentorQnA(profile.mentor_qna);
    } else {
      setMentorQnA({
        targeted_capital: null,
        reason_for_local: null,
        helpful_organizations: null,
        local_advantages: null,
        local_disadvantages: null,
        advice_for_juniors: null,
      });
    }
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-600">
              Q1. 수도권 취업/창업을 시도해 본 적이 있나요?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMentorQnA({ ...mentorQnA, targeted_capital: true })}
                aria-pressed={mentorQnA.targeted_capital === true}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  mentorQnA.targeted_capital === true
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-transparent bg-gray-100 text-gray-600'
                }`}
              >
                예
              </button>
              <button
                type="button"
                onClick={() => setMentorQnA({ ...mentorQnA, targeted_capital: false })}
                aria-pressed={mentorQnA.targeted_capital === false}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  mentorQnA.targeted_capital === false
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-transparent bg-gray-100 text-gray-600'
                }`}
              >
                아니오
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Q2. 지역에서 취·창업하게 된 이유는 무엇인가요?
            </label>
            <textarea
              value={mentorQnA.reason_for_local || ''}
              onChange={(e) => setMentorQnA({ ...mentorQnA, reason_for_local: e.target.value || null })}
              placeholder="이유를 자유롭게 작성해 주세요"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Q3. 지역 취·창업 시 도움받은 기관/멘토가 있나요?
            </label>
            <p className="mb-1 text-xs text-gray-400">예: 선배나 지인, 취업동아리, 대학일자리센터 등</p>
            <textarea
              value={mentorQnA.helpful_organizations || ''}
              onChange={(e) => setMentorQnA({ ...mentorQnA, helpful_organizations: e.target.value || null })}
              placeholder="도움을 받았던 기관/사람을 적어 주세요"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Q4. 지역 취·창업의 장점은 무엇인가요?
            </label>
            <textarea
              value={mentorQnA.local_advantages || ''}
              onChange={(e) => setMentorQnA({ ...mentorQnA, local_advantages: e.target.value || null })}
              placeholder="장점을 자유롭게 작성해 주세요"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Q5. 지역 취·창업의 단점/아쉬운 점은 무엇인가요?
            </label>
            <textarea
              value={mentorQnA.local_disadvantages || ''}
              onChange={(e) => setMentorQnA({ ...mentorQnA, local_disadvantages: e.target.value || null })}
              placeholder="단점이나 아쉬운 점을 자유롭게 작성해 주세요"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Q6. 후배들에게 전하고 싶은 조언을 적어주세요.
            </label>
            <textarea
              value={mentorQnA.advice_for_juniors || ''}
              onChange={(e) => setMentorQnA({ ...mentorQnA, advice_for_juniors: e.target.value || null })}
              placeholder="후배들에게 전하고 싶은 조언을 적어 주세요"
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={handleCancel}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 transition-all hover:text-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-bold text-white transition-all hover:bg-gray-800 disabled:bg-gray-300"
          >
            {saveMutation.isPending ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    );
  }

  if (!profile?.is_mentor) {
    return null;
  }

  const mentorQna = profile.mentor_qna;
  const hasContent =
    mentorQna &&
    (mentorQna.targeted_capital !== null ||
      mentorQna.reason_for_local ||
      mentorQna.helpful_organizations ||
      mentorQna.local_advantages ||
      mentorQna.local_disadvantages ||
      mentorQna.advice_for_juniors);

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold tracking-widest text-gray-900">선배님 Q&A</h3>
        <button
          onClick={onEdit}
          className="text-gray-300 transition-colors hover:text-gray-500"
          aria-label="선배님 Q&A 수정"
        >
          <FiEdit3 size={16} />
        </button>
      </div>

      {isEmpty || !mentorQna || !hasContent ? (
        <p className="text-xs text-gray-300">후배들을 위한 선배님 Q&A를 작성해보세요</p>
      ) : (
        <div className="space-y-4 text-sm">
          {mentorQna.targeted_capital !== null && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Q1. 수도권 취업/창업을 시도해 본 적이 있나요?</p>
              <p className="text-gray-700">{mentorQna.targeted_capital ? '예' : '아니오'}</p>
            </div>
          )}

          {mentorQna.reason_for_local && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Q2. 지역에서 취·창업하게 된 이유는 무엇인가요?</p>
              <p className="text-gray-700">{mentorQna.reason_for_local}</p>
            </div>
          )}

          {mentorQna.helpful_organizations && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Q3. 지역 취·창업 시 도움받은 기관/멘토가 있나요?</p>
              <p className="text-gray-700">{mentorQna.helpful_organizations}</p>
            </div>
          )}

          {mentorQna.local_advantages && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Q4. 지역 취·창업의 장점은 무엇인가요?</p>
              <p className="text-gray-700">{mentorQna.local_advantages}</p>
            </div>
          )}

          {mentorQna.local_disadvantages && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Q5. 지역 취·창업의 단점/아쉬운 점은 무엇인가요?</p>
              <p className="text-gray-700">{mentorQna.local_disadvantages}</p>
            </div>
          )}

          {mentorQna.advice_for_juniors && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Q6. 후배들에게 전하고 싶은 조언을 적어주세요.</p>
              <p className="text-gray-700">{mentorQna.advice_for_juniors}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
