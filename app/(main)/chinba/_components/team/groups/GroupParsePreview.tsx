'use client';

import { useState } from 'react';

import { FiAlertTriangle } from 'react-icons/fi';

import Button from '@/_components/ui/Button';
import type { ParsedGroup, ParsedGroupMember, GroupInput } from '@/_types/team';

import EditableGroupName from './EditableGroupName';

interface GroupParsePreviewProps {
  parsedGroups: ParsedGroup[];
  unmatchedNames: string[];
  unassignedMembers: { member_id: number; nickname: string }[];
  onConfirm: (groups: GroupInput[]) => void;
  onBack: () => void;
  isSaving: boolean;
}

function toGroupInputs(groups: ParsedGroup[]): GroupInput[] {
  return groups.map((pg, idx) => ({
    name: pg.name,
    display_order: idx + 1,
    members: pg.members
      .filter((m) => m.matched_member_id !== null)
      .map((m) => ({
        member_id: m.matched_member_id!,
        is_leader: m.is_leader,
      })),
  }));
}

function deepCloneGroups(groups: ParsedGroup[]): ParsedGroup[] {
  return groups.map((g) => ({
    ...g,
    members: g.members.map((m) => ({ ...m })),
  }));
}

interface MemberChipProps {
  member: ParsedGroupMember;
  onToggleLeader?: () => void;
}

function MemberChip({ member, onToggleLeader }: MemberChipProps) {
  const isLowConfidence = member.matched_member_id !== null && member.confidence < 0.7;
  const isUnmatched = member.matched_member_id === null;
  const isClickable = !isUnmatched && onToggleLeader;

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={isClickable ? onToggleLeader : undefined}
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        isUnmatched
          ? 'bg-red-50 text-red-600 line-through cursor-default'
          : isLowConfidence
          ? 'bg-amber-50 text-amber-700 border border-amber-200 active:scale-95'
          : member.is_leader
          ? 'bg-gray-900 text-white active:scale-95'
          : 'bg-gray-100 text-gray-700 active:scale-95'
      }`}
    >
      {member.nickname}
      {member.is_leader && !isUnmatched && ' ★'}
    </button>
  );
}

// EditableGroupName is now imported from ./EditableGroupName

export default function GroupParsePreview({
  parsedGroups,
  unmatchedNames,
  unassignedMembers,
  onConfirm,
  onBack,
  isSaving,
}: GroupParsePreviewProps) {
  const [groups, setGroups] = useState<ParsedGroup[]>(() => deepCloneGroups(parsedGroups));

  const groupsMissingLeader = groups.filter(
    (g) => !g.members.some((m) => m.is_leader && m.matched_member_id !== null),
  );
  const canSave = groupsMissingLeader.length === 0;

  const handleRenameGroup = (groupIdx: number, newName: string) => {
    setGroups((prev) => {
      const next = deepCloneGroups(prev);
      next[groupIdx].name = newName;
      return next;
    });
  };

  const handleToggleLeader = (groupIdx: number, memberIdx: number) => {
    setGroups((prev) => {
      const next = deepCloneGroups(prev);
      const group = next[groupIdx];
      const target = group.members[memberIdx];

      if (target.matched_member_id === null) return prev;

      if (target.is_leader) {
        // 조장 해제 시: 그룹에 다른 조장이 있어야 함
        const otherLeaders = group.members.filter(
          (m, i) => i !== memberIdx && m.is_leader && m.matched_member_id !== null,
        );
        if (otherLeaders.length === 0) return prev; // 최소 1명 유지
        target.is_leader = false;
      } else {
        target.is_leader = true;
      }

      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">파싱 결과 확인</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">멤버를 눌러 조장을 지정/해제할 수 있습니다</p>
        </div>

        {/* Unmatched names warning */}
        {unmatchedNames.length > 0 && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5">
            <FiAlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="text-xs font-medium text-amber-700">매칭되지 않은 이름</p>
              <p className="text-xs text-amber-600 mt-0.5">{unmatchedNames.join(', ')}</p>
            </div>
          </div>
        )}

        {/* Parsed groups */}
        {groups.map((group, gIdx) => {
          const hasLeader = group.members.some((m) => m.is_leader && m.matched_member_id !== null);
          return (
          <div key={gIdx} className={`rounded-xl border p-4 ${hasLeader ? 'border-gray-200' : 'border-red-200 bg-red-50/30'}`}>
            <div className="flex items-center justify-between mb-2">
              <EditableGroupName
                name={group.name}
                onChange={(v) => handleRenameGroup(gIdx, v)}
              />
              {!hasLeader && <span className="text-[11px] text-red-400">조장을 지정해주세요</span>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.members.map((member, mIdx) => (
                <MemberChip
                  key={mIdx}
                  member={member}
                  onToggleLeader={() => handleToggleLeader(gIdx, mIdx)}
                />
              ))}
            </div>
          </div>
          );
        })}

        {/* Unassigned members */}
        {unassignedMembers.length > 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">미배정 멤버</h4>
            <div className="flex flex-wrap gap-1.5">
              {unassignedMembers.map((m) => (
                <span
                  key={m.member_id}
                  className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-500"
                >
                  {m.nickname}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 py-3 pb-safe border-t border-gray-100 flex gap-2">
        <Button variant="secondary" size="md" onClick={onBack} className="flex-1">
          다시 입력
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={() => onConfirm(toGroupInputs(groups))}
          disabled={isSaving || !canSave}
          className="flex-1"
        >
          {isSaving ? '저장 중...' : '저장하기'}
        </Button>
      </div>
    </div>
  );
}
