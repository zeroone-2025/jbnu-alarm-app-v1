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

  const semesterOptions = useMemo(() => getSemesterOptions(), []);

  // Fetch timetable for selected semester
  const { data: timetable, isLoading } = useQuery<TimetableData | null>({
    queryKey: ['timetable', selectedSemester],
    queryFn: () => getUserTimetable(selectedSemester),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: isLoggedIn,  // ← 로그인 상태일 때만 API 호출
  });

  const classes = timetable?.classes ?? [];
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
      const hasUnmatched = unmatched.length > 0;

      if (hasUnmatched) {
        showToast('아직 인식이 안된 부분이 있으니 수정해주세요.', 'error');
      } else {
        showToast('인식 완료', 'success');
      }

      // 미매칭 수업 큐에 추가
      setUnmatchedQueue(unmatched);

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
      } catch (err: any) {
        setError(err.response?.data?.detail || '삭제 중 오류가 발생했습니다.');
      }
    },
    [selectedSemester, queryClient]
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
          cellHeight={cellHeight}
          showWeekends={showWeekends}
          disabled={!isLoggedIn}
          onDisabledInteraction={() => showToast('로그인 후 이용할 수 있습니다.', 'error')}
          onAdd={handleAddClass}
          onEdit={handleEditClass}
          onDelete={handleDeleteClass}
          semester={selectedSemester}
        />
      </div>

      {/* Preview overlay - fixed to viewport */}
      {overlayState === 'PREVIEW' && previewUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white p-4 pb-8">
          <div className="w-full flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-200">
            <img src={previewUrl} alt="시간표 미리보기" className="w-full h-full object-contain" />
          </div>
          <div className="mt-3 flex w-full gap-3 shrink-0">
            <Button variant="outline" size="sm" fullWidth onClick={handleCancelPreview}>
              취소
            </Button>
            <Button variant="primary" size="sm" fullWidth onClick={handleAnalyze}>
              분석하기
            </Button>
          </div>
        </div>
      )}

      {/* Analyzing overlay - fixed to viewport */}
      {overlayState === 'ANALYZING' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-500">시간표를 분석하고 있습니다...</p>
          <p className="mt-1 text-xs text-gray-400">최대 20초 정도 소요될 수 있습니다</p>
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
