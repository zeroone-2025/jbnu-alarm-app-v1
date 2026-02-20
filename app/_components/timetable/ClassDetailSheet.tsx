'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { FiX, FiTrash2, FiEdit2, FiMapPin, FiUser, FiClock, FiBook, FiAward, FiActivity, FiAlertCircle } from 'react-icons/fi';
import LoadingSpinner from '@/_components/ui/LoadingSpinner';
import { getClassDetail } from '@/_lib/api/timetable';
import type { ClassDetail, TimetableClass } from '@/_types/timetable';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const DRAG_CLOSE_DISTANCE_PX = 100;
const DRAG_CLOSE_VELOCITY_PX_PER_MS = 0.7;

interface ClassDetailSheetProps {
  cls: TimetableClass | null;
  semester?: string;
  onClose: () => void;
  onEdit: (cls: TimetableClass) => void;
  onDelete: (classId: number) => void;
}

function formatGradeType(gradeType: string): string {
  const raw = gradeType.trim();
  const lower = raw.toLowerCase();
  if (raw === '상대' || lower === 'relative') return '상대평가';
  if (raw === '절대' || lower === 'absolute') return '절대평가';
  return raw;
}

export default function ClassDetailSheet({ cls, semester, onClose, onEdit, onDelete }: ClassDetailSheetProps) {
  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startY: 0,
    deltaY: 0,
    velocityY: 0,
    lastY: 0,
    lastTime: 0,
  });

  useEffect(() => {
    if (!cls) {
      setDetail(null);
      setError(false);
      setConfirmDelete(false);
      return;
    }
    setLoading(true);
    setError(false);
    getClassDetail(cls.id, semester)
      .then(setDetail)
      .catch(() => {
        setDetail(null);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [cls?.id, semester]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!cls) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cls, onClose]);

  const handleDelete = useCallback(() => {
    if (!cls) return;
    onDelete(cls.id);
    onClose();
  }, [cls, onDelete, onClose]);

  const handleDragStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-no-drag="true"]')) return;

    const sheet = sheetRef.current;
    if (!sheet) return;

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const now = performance.now();
    dragRef.current = {
      active: true,
      startY: e.clientY,
      deltaY: 0,
      velocityY: 0,
      lastY: e.clientY,
      lastTime: now,
    };
    sheet.style.transition = 'none';
  }, []);

  const handleDragMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const sheet = sheetRef.current;
    if (!sheet) return;

    const deltaY = Math.max(0, e.clientY - dragRef.current.startY);
    const now = performance.now();
    const dt = Math.max(now - dragRef.current.lastTime, 1);
    const dy = e.clientY - dragRef.current.lastY;
    const instantaneousVelocity = Math.max(0, dy / dt);
    dragRef.current.velocityY = instantaneousVelocity * 0.7 + dragRef.current.velocityY * 0.3;
    dragRef.current.lastY = e.clientY;
    dragRef.current.lastTime = now;
    dragRef.current.deltaY = deltaY;
    sheet.style.transform = `translateY(${deltaY}px)`;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;

    const sheet = sheetRef.current;
    if (!sheet) return;

    const shouldClose =
      dragRef.current.deltaY > DRAG_CLOSE_DISTANCE_PX ||
      (dragRef.current.deltaY > 30 && dragRef.current.velocityY > DRAG_CLOSE_VELOCITY_PX_PER_MS);

    sheet.style.transition = 'transform 0.2s ease-out';

    if (shouldClose) {
      onClose();
      return;
    }

    sheet.style.transform = 'translateY(0)';
  }, [onClose]);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || !cls) return;
    sheet.style.transform = 'translateY(0)';
    sheet.style.transition = '';
  }, [cls]);

  if (!cls) return null;

  const dayLabel = DAY_LABELS[cls.day] ?? '';
  const displayedProfessor = detail?.professor ?? cls.professor;
  const displayedLocation = detail?.location ?? cls.location;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className="w-[calc(100%-1rem)] max-w-lg max-h-[78vh] rounded-t-2xl bg-white shadow-2xl animate-bottom-sheet-up flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 드래그 영역 (핸들 + 헤더) */}
        <div
          className="shrink-0 touch-none cursor-grab active:cursor-grabbing"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          {/* 핸들 */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-gray-200" />
          </div>

          {/* 헤더 */}
          <div className="flex items-start justify-between px-5 py-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">{cls.name}</h2>
            </div>
            <button
              data-no-drag="true"
              onClick={onClose}
              className="ml-3 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 shrink-0"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* 구분선 */}
        <div className="shrink-0 mx-5 border-t border-gray-100" />

        {/* 상세 정보 */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <>
              <InfoRow icon={<FiClock size={14} />} label="시간">
                {dayLabel}요일 {cls.start_time} ~ {cls.end_time}
              </InfoRow>

              {displayedProfessor && (
                <InfoRow icon={<FiUser size={14} />} label="담당교수">
                  {displayedProfessor}
                </InfoRow>
              )}

              {displayedLocation && (
                <InfoRow icon={<FiMapPin size={14} />} label="강의실">
                  {displayedLocation}
                </InfoRow>
              )}

              {detail?.credits != null && (
                <InfoRow icon={<FiAward size={14} />} label="학점">
                  {detail.credits}학점
                </InfoRow>
              )}

              {detail?.grade_type && (
                <InfoRow icon={<FiActivity size={14} />} label="평가방식">
                  {formatGradeType(detail.grade_type)}
                </InfoRow>
              )}

              {(detail?.field_area || detail?.field_detail) && (
                <InfoRow icon={<FiBook size={14} />} label="교양분야">
                  {[detail.field_area, detail.field_detail].filter(Boolean).join(' · ')}
                </InfoRow>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-400">
                  <FiAlertCircle size={12} />
                  수강편람 정보를 불러올 수 없습니다
                </div>
              )}
            </>
          )}
        </div>

        {/* 버튼 영역 */}
        <div className="shrink-0 px-5 pb-8 pt-2 space-y-2">
          {confirmDelete ? (
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white hover:bg-red-600 active:scale-95 transition-all"
              >
                삭제하기
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  if (cls) onEdit(cls);
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 active:scale-95 transition-all"
              >
                <FiEdit2 size={14} />
                수정하기
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-medium text-red-500 hover:bg-red-50 active:scale-95 transition-all"
              >
                <FiTrash2 size={14} />
                시간표에서 삭제
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-gray-400 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-800">{children}</p>
      </div>
    </div>
  );
}
