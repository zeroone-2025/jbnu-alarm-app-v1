'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiUpload, FiTrash2 } from 'react-icons/fi';
import Button from '@/_components/ui/Button';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import ConfirmModal from '@/_components/ui/ConfirmModal';
import { useUser } from '@/_lib/hooks/useUser';
import { useToast } from '@/_context/ToastContext';
import {
  getUserTimetable,
  uploadTimetableImage,
  addTimetableClass,
  updateTimetableClass,
  deleteTimetableClass,
  deleteTimetable,
} from '@/_lib/api/timetable';
import type { TimetableData, TimetableClass, UnmatchedClass } from '@/_types/timetable';
import TimetableGrid from './TimetableGrid';
import UnmatchedQueue from './UnmatchedQueue';
import AddClassModal from './AddClassModal';

type OverlayState = null | 'PREVIEW' | 'ANALYZING';

const SEMESTER_LABELS: Record<string, string> = {
  '1': '1학기',
  'summer': '여름학기',
  '2': '2학기',
  'winter': '겨울학기',
};
const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '10:00';

function isValidTimeString(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^\d{2}:\d{2}$/.test(value);
}

function toMinutes(value: string): number {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function toTimeString(minutes: number): string {
  const normalized = Math.max(0, Math.min(minutes, 23 * 60 + 59));
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function normalizeUnmatchedClass(item: UnmatchedClass) {
  const day = item.day ?? 0;
  const validStart = isValidTimeString(item.start_time);
  const validEnd = isValidTimeString(item.end_time);

  let startTime = validStart ? item.start_time : null;
  let endTime = validEnd ? item.end_time : null;

  if (!startTime && endTime) startTime = toTimeString(toMinutes(endTime) - 60);
  if (startTime && !endTime) endTime = toTimeString(toMinutes(startTime) + 60);
  if (!startTime) startTime = DEFAULT_START_TIME;
  if (!endTime) endTime = DEFAULT_END_TIME;

  const missingParts: string[] = [];
  if (item.day === null) missingParts.push('요일');
  if (!validStart || !validEnd) missingParts.push('시간');

  const dayLabel = DAY_LABELS[day] ?? '요일';
  const baseReason = `${dayLabel}요일 ${startTime}~${endTime}`;
  const reason = missingParts.length > 0
    ? `${baseReason} - ${missingParts.join('/')} 정보가 없어 임시값으로 저장했어요. 확인 후 수정해 주세요.`
    : `${baseReason} - 해당 시간에 맞는 수업을 찾지 못했습니다. 수정 부탁드립니다.`;

  return { day, startTime, endTime, reason };
}

function getSemesterOptions(): { value: string; label: string }[] {
  const now = new Date();
  const year = now.getFullYear();
  const keys = ['1', 'summer', '2', 'winter'];
  return keys.map((key) => ({
    value: `${year}-${key}`,
    label: `${year} ${SEMESTER_LABELS[key]}`,
  }));
}

function getCurrentSemester(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // Mar-Jun = 1학기, Jul-Aug = 여름학기, Sep-Dec = 2학기, Jan-Feb = 겨울학기
  if (month >= 2 && month <= 6) return `${year}-1`;
  if (month == 7) return `${year}-summer`;
  if (month >= 8 && month <= 12) return `${year}-2`;
  return `${year}-winter`;
}

export default function TimetableTab() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn } = useUser();
  const { showToast } = useToast();

  const [selectedSemester, setSelectedSemester] = useState(getCurrentSemester);
  const [overlayState, setOverlayState] = useState<OverlayState>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gridHeight, setGridHeight] = useState(0);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [unmatchedQueue, setUnmatchedQueue] = useState<UnmatchedClass[]>([]);
  const [editingClass, setEditingClass] = useState<TimetableClass | null>(null);
  const [needsReviewIds, setNeedsReviewIds] = useState<number[]>([]);
  const [reviewReasonById, setReviewReasonById] = useState<Record<number, string>>({});

  const semesterOptions = useMemo(() => getSemesterOptions(), []);

  // Fetch timetable for selected semester
  const { data: timetable, isLoading } = useQuery<TimetableData | null>({
    queryKey: ['timetable', selectedSemester],
    queryFn: () => getUserTimetable(selectedSemester),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: isLoggedIn,  // ← 로그인 상태일 때만 API 호출
  });

  const classes = useMemo(() => timetable?.classes ?? [], [timetable]);
  const showWeekends = true;

  // Dynamic height calculation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setGridHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // cellHeight = available grid body height / 12 hours
  // Grid header ~28px, pt-2 padding ~8px → subtract from gridHeight
  const cellHeight = useMemo(() => {
    const bodyHeight = gridHeight - 28 - 8; // header + padding
    return Math.max(Math.floor(bodyHeight / 13), 36);
  }, [gridHeight]);

  const resetFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      resetFileInput();
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setOverlayState('PREVIEW');
    setError(null);
    setSelectedFile(file);
    resetFileInput();
  }, [resetFileInput]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;
    setOverlayState('ANALYZING');
    setError(null);
    try {
      const result = await uploadTimetableImage(selectedFile, selectedSemester);
      queryClient.setQueryData(['timetable', selectedSemester], result.timetable);

      const unmatched = result.unmatched_classes ?? [];
      const autoAddedClasses: TimetableClass[] = [];
      const autoAddFailed: UnmatchedClass[] = [];
      const autoAddedReasons: Record<number, string> = {};

      for (const item of unmatched) {
        const normalized = normalizeUnmatchedClass(item);
        try {
          const addedClass = await addTimetableClass(
            {
              name: item.name,
              professor: item.professor ?? undefined,
              location: item.location ?? undefined,
              day: normalized.day,
              start_time: normalized.startTime,
              end_time: normalized.endTime,
            },
            selectedSemester
          );
          autoAddedClasses.push(addedClass);
          autoAddedReasons[addedClass.id] = normalized.reason;
        } catch {
          autoAddFailed.push(item);
        }
      }

      if (autoAddedClasses.length > 0) {
        queryClient.setQueryData(['timetable', selectedSemester], (old: TimetableData | null | undefined) => {
          if (!old) return old;
          return { ...old, classes: [...old.classes, ...autoAddedClasses] };
        });
      }

      if (autoAddedClasses.length > 0) {
        const autoAddedIds = autoAddedClasses.map((cls) => cls.id);
        setNeedsReviewIds((prev) => Array.from(new Set([...prev, ...autoAddedIds])));
        setReviewReasonById((prev) => ({ ...prev, ...autoAddedReasons }));
      }

      setUnmatchedQueue([]);

      if (autoAddFailed.length > 0) {
        showToast(`자동 반영 ${autoAddedClasses.length}개 · 저장 실패 ${autoAddFailed.length}개`, 'error');
      } else if (autoAddedClasses.length > 0) {
        showToast(`자동 반영 ${autoAddedClasses.length}개`, 'info');
      } else {
        showToast('인식 완료', 'success');
      }

      // 시스템 경고만 에러 배너로 표시
      if (result.warnings.length > 0) {
        setError(result.warnings.join('\n'));
      }
      setOverlayState(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || '시간표 분석 중 오류가 발생했습니다.');
      setOverlayState('PREVIEW');
    }
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    resetFileInput();
  }, [selectedFile, selectedSemester, previewUrl, queryClient, showToast, resetFileInput]);

  const handleCancelPreview = useCallback(() => {
    setOverlayState(null);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    resetFileInput();
  }, [previewUrl, resetFileInput]);

  const handleDeleteAll = useCallback(async () => {
    try {
      await deleteTimetable(selectedSemester);
      queryClient.setQueryData(['timetable', selectedSemester], null);
      setNeedsReviewIds([]);
      setReviewReasonById({});
    } catch (err: any) {
      setError(err.response?.data?.detail || '삭제 중 오류가 발생했습니다.');
    }
    setShowDeleteAllModal(false);
  }, [selectedSemester, queryClient]);

  const handleAddClass = useCallback(
    async (data: { name: string; professor?: string; location?: string; day: number; start_time: string; end_time: string }) => {
      try {
        const newClass = await addTimetableClass(data, selectedSemester);
        queryClient.setQueryData(['timetable', selectedSemester], (old: TimetableData | null | undefined) => {
          if (!old) {
            queryClient.invalidateQueries({ queryKey: ['timetable', selectedSemester] });
            return old;
          }
          return { ...old, classes: [...old.classes, newClass] };
        });
      } catch (err: any) {
        setError(err.response?.data?.detail || '추가 중 오류가 발생했습니다.');
        throw err;
      }
    },
    [selectedSemester, queryClient]
  );

  const handleDeleteClass = useCallback(
    async (classId: number) => {
      try {
        const result = await deleteTimetableClass(classId);
        const deletedIds = new Set(
          result.deleted_class_ids && result.deleted_class_ids.length > 0
            ? result.deleted_class_ids
            : [classId]
        );
        queryClient.setQueryData(['timetable', selectedSemester], (old: TimetableData | null | undefined) => {
          if (!old) return old;
          return { ...old, classes: old.classes.filter((c) => !deletedIds.has(c.id)) };
        });
        setNeedsReviewIds((prev) => prev.filter((id) => !deletedIds.has(id)));
        setReviewReasonById((prev) => {
          const next = { ...prev };
          deletedIds.forEach((id) => {
            delete next[id];
          });
          return next;
        });
      } catch (err: any) {
        setError(err.response?.data?.detail || '삭제 중 오류가 발생했습니다.');
      }
    },
    [selectedSemester, queryClient]
  );

  const handleDeleteClassesByName = useCallback(
    async (name: string) => {
      const targetIds = Array.from(
        new Set(classes.filter((cls) => cls.name === name).map((cls) => cls.id))
      );
      if (targetIds.length === 0) return;

      const deletedIds = new Set<number>();

      for (const classId of targetIds) {
        if (deletedIds.has(classId)) continue;
        try {
          const result = await deleteTimetableClass(classId);
          const ids =
            result.deleted_class_ids && result.deleted_class_ids.length > 0
              ? result.deleted_class_ids
              : [classId];
          ids.forEach((id) => deletedIds.add(id));
        } catch (err: any) {
          if (err?.response?.status === 404) {
            deletedIds.add(classId);
            continue;
          }
          setError(err.response?.data?.detail || '삭제 중 오류가 발생했습니다.');
          break;
        }
      }

      if (deletedIds.size === 0) return;

      queryClient.setQueryData(['timetable', selectedSemester], (old: TimetableData | null | undefined) => {
        if (!old) return old;
        return { ...old, classes: old.classes.filter((c) => !deletedIds.has(c.id)) };
      });
      setNeedsReviewIds((prev) => prev.filter((id) => !deletedIds.has(id)));
      setReviewReasonById((prev) => {
        const next = { ...prev };
        deletedIds.forEach((id) => {
          delete next[id];
        });
        return next;
      });
    },
    [classes, selectedSemester, queryClient]
  );

  const handleEditClass = useCallback((cls: TimetableClass) => {
    setEditingClass(cls);
  }, []);

  const handleUpdateClass = useCallback(
    async (data: { name: string; location?: string; day: number; start_time: string; end_time: string }) => {
      if (!editingClass) return;
      try {
        const updated = await updateTimetableClass(editingClass.id, data);
        queryClient.setQueryData(['timetable', selectedSemester], (old: TimetableData | null | undefined) => {
          if (!old) return old;
          return { ...old, classes: old.classes.map((c) => c.id === updated.id ? updated : c) };
        });
        setNeedsReviewIds((prev) => prev.filter((id) => id !== updated.id));
        setReviewReasonById((prev) => {
          const next = { ...prev };
          delete next[updated.id];
          return next;
        });
        setEditingClass(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || '수정 중 오류가 발생했습니다.');
      }
    },
    [editingClass, selectedSemester, queryClient]
  );

  const handleQueueDismiss = useCallback((index: number) => {
    setUnmatchedQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Error banner (시스템 경고만) */}
      {error && (
        <div className="mx-4 mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 shrink-0">
          {error}
        </div>
      )}

      {/* 미매칭 수업 직접 입력 큐 */}
      <UnmatchedQueue
        items={unmatchedQueue}
        onAdd={handleAddClass}
        onDismiss={handleQueueDismiss}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-gray-900"
        >
          {semesterOptions.map((sem) => (
            <option key={sem.value} value={sem.value}>
              {sem.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!isLoggedIn) {
                showToast('로그인 후 이용할 수 있습니다.', 'error');
                return;
              }
              resetFileInput();
              fileInputRef.current?.click();
            }}
            className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
          >
            <FiUpload size={12} />
            에브리타임 시간표 업로드
          </button>
          {classes.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 active:scale-95 transition-all"
              title="전체 삭제"
            >
              <FiTrash2 size={14} />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Grid container (takes remaining space) */}
      <div ref={containerRef} className="relative flex-1 min-h-0 mx-2 mb-2 rounded-xl border border-gray-200 bg-white overflow-hidden">
        <TimetableGrid
          classes={classes}
          needsReviewIds={needsReviewIds}
          reviewReasonById={reviewReasonById}
          cellHeight={cellHeight}
          showWeekends={showWeekends}
          disabled={!isLoggedIn}
          onDisabledInteraction={() => showToast('로그인 후 이용할 수 있습니다.', 'error')}
          onAdd={handleAddClass}
          onEdit={handleEditClass}
          onDelete={handleDeleteClass}
          onDeleteByName={handleDeleteClassesByName}
          semester={selectedSemester}
        />

        {/* Preview overlay - Grid 내부에 위치 */}
        {overlayState === 'PREVIEW' && previewUrl && (
          <div className="absolute inset-0 z-30 bg-white p-2">
            <div className="w-full h-full overflow-hidden rounded-lg border border-gray-200">
              <img src={previewUrl} alt="시간표 미리보기" className="w-full h-full object-contain" />
            </div>
          </div>
        )}

        {/* Analyzing overlay - Grid 내부에 위치 */}
        {overlayState === 'ANALYZING' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-gray-500">시간표를 분석하고 있습니다...</p>
            <p className="mt-1 text-xs text-gray-400">최대 20초 정도 소요될 수 있습니다</p>
          </div>
        )}
      </div>

      {/* Preview 버튼 - 화면 하단 고정 */}
      {overlayState === 'PREVIEW' && previewUrl && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white px-4 py-3 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex gap-3 max-w-lg mx-auto">
            <Button variant="outline" size="sm" fullWidth onClick={handleCancelPreview}>
              취소
            </Button>
            <Button variant="primary" size="sm" fullWidth onClick={handleAnalyze}>
              분석하기
            </Button>
          </div>
        </div>
      )}

      {/* 전체 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showDeleteAllModal}
        variant="danger"
        confirmLabel="삭제"
        onConfirm={handleDeleteAll}
        onCancel={() => setShowDeleteAllModal(false)}
      >
        시간표를 전체 삭제하시겠습니까?
      </ConfirmModal>

      {/* 수정 모달 */}
      <AddClassModal
        isOpen={!!editingClass}
        day={editingClass?.day ?? 0}
        startTime={editingClass?.start_time ?? '08:00'}
        endTime={editingClass?.end_time ?? '09:00'}
        editingClass={editingClass}
        onSubmit={handleUpdateClass}
        onClose={() => setEditingClass(null)}
      />
    </div>
  );
}
