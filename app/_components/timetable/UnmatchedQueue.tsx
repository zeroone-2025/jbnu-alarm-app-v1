'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiEdit2, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import type { UnmatchedClass } from '@/_types/timetable';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'));
const MINUTE_OPTIONS = ['00', '15', '30', '45'];

interface UnmatchedQueueProps {
  items: UnmatchedClass[];
  onAdd: (data: {
    name: string;
    professor?: string;
    location?: string;
    day: number;
    start_time: string;
    end_time: string;
  }) => Promise<void>;
  onDismiss: (index: number) => void;
}

interface EditState {
  index: number;
  name: string;
  professor: string;
  day: number;
  start_time: string;
  end_time: string;
  location: string;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function normalizeQuarterTime(time: string, fallback: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return fallback;
  }

  const snappedMinute = Math.floor(minute / 15) * 15;
  return `${String(hour).padStart(2, '0')}:${String(snappedMinute).padStart(2, '0')}`;
}

function updateTimePart(time: string, part: 'hour' | 'minute', value: string): string {
  const [hour, minute] = time.split(':');
  if (part === 'hour') return `${value}:${minute}`;
  return `${hour}:${value}`;
}

// 각 아이템에 안정적인 id 부여 (index 대신)
let nextId = 0;
function generateId(): string {
  return `unmatched-${++nextId}`;
}

export default function UnmatchedQueue({ items, onAdd, onDismiss }: UnmatchedQueueProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 아이템별 안정적인 key 생성
  const itemKeys = useMemo(() => items.map(() => generateId()), [items]);

  // ESC 키로 편집 모달 닫기
  useEffect(() => {
    if (!editState) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditState(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editState]);

  const handleEdit = useCallback((item: UnmatchedClass, index: number) => {
    setEditState({
      index,
      name: item.name,
      professor: item.professor ?? '',
      day: item.day ?? 0,
      start_time: normalizeQuarterTime(item.start_time ?? '09:00', '09:00'),
      end_time: normalizeQuarterTime(item.end_time ?? '10:00', '10:00'),
      location: item.location ?? '',
    });
  }, []);

  const isTimeValid = editState
    ? timeToMinutes(editState.start_time) < timeToMinutes(editState.end_time)
    : true;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editState || submitting || !isTimeValid) return;

    setSubmitting(true);
    try {
      await onAdd({
        name: editState.name,
        professor: editState.professor || undefined,
        location: editState.location || undefined,
        day: editState.day,
        start_time: editState.start_time,
        end_time: editState.end_time,
      });
      onDismiss(editState.index);
      setEditState(null);
    } catch {
      // onAdd 실패 시 큐에서 제거하지 않음 — 에러는 부모에서 처리
    } finally {
      setSubmitting(false);
    }
  }, [editState, submitting, isTimeValid, onAdd, onDismiss]);

  if (items.length === 0) return null;

  return (
    <div className="mx-2 mb-2 rounded-xl border border-amber-200 bg-amber-50 overflow-hidden shrink-0">
      {/* 헤더 */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
            {items.length}
          </span>
          <span className="text-xs font-semibold text-amber-800">
            직접 입력이 필요한 수업
          </span>
        </div>
        {isExpanded ? (
          <FiChevronUp size={14} className="text-amber-500" />
        ) : (
          <FiChevronDown size={14} className="text-amber-500" />
        )}
      </button>

      {/* 목록 */}
      {isExpanded && (
        <div className="border-t border-amber-200 divide-y divide-amber-100">
          {items.map((item, i) => (
            <div key={itemKeys[i]} className="flex items-center gap-2 px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-[10px] text-amber-600">
                  {item.day !== null ? `${DAY_LABELS[item.day]}요일` : '요일 미확인'}
                  {item.start_time ? ` · ${item.start_time}~` : ''}
                  {item.end_time ?? ''}
                  {item.professor ? ` · ${item.professor}` : ''}
                </p>
              </div>
              <button
                onClick={() => handleEdit(item, i)}
                className="flex items-center gap-1 rounded-lg bg-amber-400 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-amber-500 active:scale-95 transition-all shrink-0"
              >
                <FiEdit2 size={10} />
                직접 입력
              </button>
              <button
                onClick={() => onDismiss(i)}
                className="rounded-full p-1 text-amber-400 hover:bg-amber-100 shrink-0"
                title="무시"
              >
                <FiX size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 인라인 편집 폼 */}
      {editState !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setEditState(null)}>
          <div
            className="w-[90%] max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800">수업 직접 입력</h3>
              <button onClick={() => setEditState(null)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">과목명 *</label>
                <input
                  type="text"
                  value={editState.name}
                  onChange={(e) => setEditState((s) => s && { ...s, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">요일</label>
                <div className="flex gap-1">
                  {DAY_LABELS.slice(0, 5).map((label, d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setEditState((s) => s && { ...s, day: d })}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                        editState.day === d
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-gray-600">시작</label>
                  <div className="flex gap-1">
                    <select
                      value={editState.start_time.split(':')[0]}
                      onChange={(e) => setEditState((s) => s && { ...s, start_time: updateTimePart(s.start_time, 'hour', e.target.value) })}
                      className="w-1/2 rounded-xl border border-gray-200 px-2 py-2.5 text-sm outline-none focus:border-gray-900 bg-white"
                    >
                      {HOUR_OPTIONS.map((hour) => (
                        <option key={hour} value={hour}>{hour}시</option>
                      ))}
                    </select>
                    <select
                      value={editState.start_time.split(':')[1]}
                      onChange={(e) => setEditState((s) => s && { ...s, start_time: updateTimePart(s.start_time, 'minute', e.target.value) })}
                      className="w-1/2 rounded-xl border border-gray-200 px-2 py-2.5 text-sm outline-none focus:border-gray-900 bg-white"
                    >
                      {MINUTE_OPTIONS.map((minute) => (
                        <option key={minute} value={minute}>{minute}분</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-gray-600">종료</label>
                  <div className="flex gap-1">
                    <select
                      value={editState.end_time.split(':')[0]}
                      onChange={(e) => setEditState((s) => s && { ...s, end_time: updateTimePart(s.end_time, 'hour', e.target.value) })}
                      className="w-1/2 rounded-xl border border-gray-200 px-2 py-2.5 text-sm outline-none focus:border-gray-900 bg-white"
                    >
                      {HOUR_OPTIONS.map((hour) => (
                        <option key={hour} value={hour}>{hour}시</option>
                      ))}
                    </select>
                    <select
                      value={editState.end_time.split(':')[1]}
                      onChange={(e) => setEditState((s) => s && { ...s, end_time: updateTimePart(s.end_time, 'minute', e.target.value) })}
                      className="w-1/2 rounded-xl border border-gray-200 px-2 py-2.5 text-sm outline-none focus:border-gray-900 bg-white"
                    >
                      {MINUTE_OPTIONS.map((minute) => (
                        <option key={minute} value={minute}>{minute}분</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {!isTimeValid && (
                <p className="text-[11px] text-red-500">종료 시간은 시작 시간보다 이후여야 합니다</p>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">교수명 (선택)</label>
                <input
                  type="text"
                  value={editState.professor}
                  onChange={(e) => setEditState((s) => s && { ...s, professor: e.target.value })}
                  placeholder="예: 홍길동"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">강의실 (선택)</label>
                <input
                  type="text"
                  value={editState.location}
                  onChange={(e) => setEditState((s) => s && { ...s, location: e.target.value })}
                  placeholder="예: 공대7호관 301"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
                />
              </div>

              <button
                type="submit"
                disabled={!editState.name.trim() || !isTimeValid || submitting}
                className="mt-2 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white disabled:opacity-40 active:scale-95 transition-all"
              >
                {submitting ? '추가 중...' : '추가'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
