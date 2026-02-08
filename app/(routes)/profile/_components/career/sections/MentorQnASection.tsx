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
              수도권 취창업을 목표한 적이 있나요?
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={mentorQnA.targeted_capital === true}
                  onChange={() => setMentorQnA({ ...mentorQnA, targeted_capital: true })}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">예</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={mentorQnA.targeted_capital === false}
                  onChange={() => setMentorQnA({ ...mentorQnA, targeted_capital: false })}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">아니오</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              수도권이 아닌 지역을 택한 이유가 있나요?
            </label>
            <textarea
              value={mentorQnA.reason_for_local || ''}
              onChange={(e) => setMentorQnA({ ...mentorQnA, reason_for_local: e.target.value || null })}
              placeholder="이유를 자유롭게 작성해주세요"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              지역 취창업시 도움받은 기관이나 멘토가 있나요?
            </label>
            <textarea
              value={mentorQnA.helpful_organizations || ''}
              onChange={(e) => setMentorQnA({ ...mentorQnA, helpful_organizations: e.target.value || null })}
              placeholder="기관명, 프로그램명 등을 작성해주세요"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              내가 생각하는 지역 취창업 장점
            </label>
            <textarea
              value={mentorQnA.local_advantages || ''}
              onChange={(e) => setMentorQnA({ ...mentorQnA, local_advantages: e.target.value || null })}
              placeholder="장점을 자유롭게 작성해주세요"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              내가 생각하는 지역 취창업 단점
            </label>
            <textarea
              value={mentorQnA.local_disadvantages || ''}
              onChange={(e) => setMentorQnA({ ...mentorQnA, local_disadvantages: e.target.value || null })}
              placeholder="단점을 자유롭게 작성해주세요"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              지역 취창업을 준비하는 후배에게 해주고 싶은 말
            </label>
            <textarea
              value={mentorQnA.advice_for_juniors || ''}
              onChange={(e) => setMentorQnA({ ...mentorQnA, advice_for_juniors: e.target.value || null })}
              placeholder="후배들에게 전하고 싶은 조언을 작성해주세요"
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

  const hasContent =
    profile?.mentor_qna &&
    (profile.mentor_qna.reason_for_local ||
      profile.mentor_qna.helpful_organizations ||
      profile.mentor_qna.local_advantages ||
      profile.mentor_qna.local_disadvantages ||
      profile.mentor_qna.advice_for_juniors);

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold tracking-widest text-gray-900">멘토 Q&A</h3>
        <button
          onClick={onEdit}
          className="text-gray-300 transition-colors hover:text-gray-500"
          aria-label="멘토 Q&A 수정"
        >
          <FiEdit3 size={16} />
        </button>
      </div>

      {isEmpty || !hasContent ? (
        <p className="text-xs text-gray-300">후배들을 위한 멘토 Q&A를 작성해보세요</p>
      ) : (
        <div className="space-y-4 text-sm">
          {profile?.mentor_qna?.reason_for_local && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Q. 지역을 선택한 이유</p>
              <p className="text-gray-700">{profile.mentor_qna.reason_for_local}</p>
            </div>
          )}

          {profile?.mentor_qna?.helpful_organizations && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Q. 도움받은 기관/멘토</p>
              <p className="text-gray-700">{profile.mentor_qna.helpful_organizations}</p>
            </div>
          )}

          {profile?.mentor_qna?.local_advantages && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Q. 지역 취창업 장점</p>
              <p className="text-gray-700">{profile.mentor_qna.local_advantages}</p>
            </div>
          )}

          {profile?.mentor_qna?.local_disadvantages && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Q. 지역 취창업 단점</p>
              <p className="text-gray-700">{profile.mentor_qna.local_disadvantages}</p>
            </div>
          )}

          {profile?.mentor_qna?.advice_for_juniors && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Q. 후배들에게 전하는 조언</p>
              <p className="text-gray-700">{profile.mentor_qna.advice_for_juniors}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
