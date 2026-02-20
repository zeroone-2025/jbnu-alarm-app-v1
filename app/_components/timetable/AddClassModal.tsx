'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiX } from 'react-icons/fi';
import Button from '@/_components/ui/Button';
import type { TimetableClass } from '@/_types/timetable';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 8; h <= 21; h++) {
    options.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 21) {
      options.push(`${h.toString().padStart(2, '0')}:15`);
      options.push(`${h.toString().padStart(2, '0')}:30`);
      options.push(`${h.toString().padStart(2, '0')}:45`);
    }
  }
  return options;
}

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
  const [selectedDay, setSelectedDay] = useState(day);
  const [selectedStartTime, setSelectedStartTime] = useState(startTime);
  const [selectedEndTime, setSelectedEndTime] = useState(endTime);

  const isEditMode = !!editingClass;
  const timeOptions = useMemo(() => generateTimeOptions(), []);

  useEffect(() => {
    if (isOpen && editingClass) {
      setName(editingClass.name);
      setLocation(editingClass.location ?? '');
      setSelectedDay(editingClass.day);
      setSelectedStartTime(editingClass.start_time);
      setSelectedEndTime(editingClass.end_time);
    } else if (isOpen && !editingClass) {
      setSelectedDay(day);
      setSelectedStartTime(startTime);
      setSelectedEndTime(endTime);
    } else if (!isOpen) {
      setName('');
      setLocation('');
    }
  }, [isOpen, editingClass, day, startTime, endTime]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      location: location.trim() || undefined,
      day: selectedDay,
      start_time: selectedStartTime,
      end_time: selectedEndTime,
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

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 시간 정보 - 수정 모드에서는 편집 가능 */}
          {isEditMode ? (
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">요일</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900 bg-white"
                >
                  {DAY_LABELS.map((label, idx) => (
                    <option key={idx} value={idx}>{label}요일</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-gray-600">시작</label>
                  <select
                    value={selectedStartTime}
                    onChange={(e) => setSelectedStartTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900 bg-white"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-gray-600">종료</label>
                  <select
                    value={selectedEndTime}
                    onChange={(e) => setSelectedEndTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-900 bg-white"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
              {DAY_LABELS[day]}요일 {startTime} ~ {endTime}
            </div>
          )}

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
