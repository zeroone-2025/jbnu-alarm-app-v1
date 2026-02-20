'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Button from '@/_components/ui/Button';
import type { TimetableClass } from '@/_types/timetable';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

interface AddClassModalProps {
  isOpen: boolean;
  day: number;
  startTime: string;
  endTime: string;
  editingClass?: TimetableClass | null;
  onSubmit: (data: { name: string; location?: string; day: number; start_time: string; end_time: string }) => void;
  onClose: () => void;
}

export default function AddClassModal({ isOpen, day, startTime, endTime, editingClass, onSubmit, onClose }: AddClassModalProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const isEditMode = !!editingClass;

  useEffect(() => {
    if (isOpen && editingClass) {
      setName(editingClass.name);
      setLocation(editingClass.location ?? '');
    } else if (!isOpen) {
      setName('');
      setLocation('');
    }
  }, [isOpen, editingClass]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      location: location.trim() || undefined,
      day,
      start_time: startTime,
      end_time: endTime,
    });
    setName('');
    setLocation('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-[90%] max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800">{isEditMode ? '일정 수정' : '일정 추가'}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <FiX size={18} />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
          {DAY_LABELS[day]}요일 {startTime} ~ {endTime}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">이름 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="과목명 또는 일정명"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">장소</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="강의실 (선택)"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>
          <Button
            type="submit"
            disabled={!name.trim()}
            fullWidth
            size="md"
            className="mt-2"
          >
            {isEditMode ? '수정' : '추가'}
          </Button>
        </form>
      </div>
    </div>
  );
}
