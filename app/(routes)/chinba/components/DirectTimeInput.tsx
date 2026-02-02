'use client';

import { useState } from 'react';
import { generateSlotRange } from '../lib/utils';
import type { DayOfWeek, AvailabilitySlot } from '../types';

interface DirectTimeInputProps {
  dates: string[];
  timeSlots: string[];
  onAddSlots: (slots: AvailabilitySlot[]) => void;
}

export default function DirectTimeInput({
  dates,
  timeSlots,
  onAddSlots,
}: DirectTimeInputProps) {
  const [selectedDate, setSelectedDate] = useState(dates[0] || '');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const handleAdd = () => {
    if (!selectedDate || !startTime || !endTime) return;
    
    // 시작 시간이 종료 시간보다 늦은지 확인
    if (startTime >= endTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }
    
    const slots = generateSlotRange(selectedDate, startTime, endTime);
    onAddSlots(slots);
    
    // 초기화
    setStartTime('09:00');
    setEndTime('10:00');
    setSelectedDate(dates[0] || '');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">직접 작성하기</h3>
      <p className="text-sm text-gray-500 mb-6">
        요일과 시간을 선택하여 가능한 시간을 추가하세요
      </p>

      <div className="space-y-4">
        {/* 요일 선택 */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            요일
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {dates.map((date) => {
              const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
              const dayIndex = new Date(date).getDay();
              return (
                <option key={date} value={date}>
                  {dayNames[dayIndex]}요일 ({date})
                </option>
              );
            })}
          </select>
        </div>

        {/* 시간 범위 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              시작 시간
            </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              종료 시간
            </label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 outline-none appearance-none cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 추가 버튼 */}
        <button
          onClick={handleAdd}
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          추가하기
        </button>
      </div>
    </div>
  );
}
