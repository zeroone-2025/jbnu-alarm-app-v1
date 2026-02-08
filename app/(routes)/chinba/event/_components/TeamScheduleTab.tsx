'use client';

import { FiCheck, FiClock } from 'react-icons/fi';
import ChinbaHeatmapGrid from './ChinbaHeatmapGrid';
import type { ChinbaEventDetail, ChinbaRecommendedTime } from '@/_types/chinba';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function formatRecommendedTime(rec: ChinbaRecommendedTime): string {
  const dt = new Date(rec.date);
  const dayLabel = DAY_LABELS[dt.getDay()];
  return `${dt.getMonth() + 1}/${dt.getDate()}(${dayLabel}) ${rec.start_time}~${rec.end_time}`;
}

interface TeamScheduleTabProps {
  event: ChinbaEventDetail;
}

export default function TeamScheduleTab({ event }: TeamScheduleTabProps) {
  const submittedCount = event.participants.filter((p) => p.has_submitted).length;
  const totalCount = event.participants.length;

  return (
    <div className="px-4 pb-6">
      {/* Participants */}
      <div className="mb-4">
        <h3 className="text-xs font-bold text-gray-500 mb-2">
          참여자 ({submittedCount}/{totalCount} 제출)
        </h3>
        <div className="flex flex-wrap gap-2">
          {event.participants.map((p) => (
            <div
              key={p.user_id}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                p.has_submitted
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {p.has_submitted && <FiCheck size={10} />}
              <span>{p.nickname || `유저${p.user_id}`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className="mb-4">
        <h3 className="text-xs font-bold text-gray-500 mb-2">전체 일정 히트맵</h3>
        {submittedCount === 0 ? (
          <div className="rounded-xl border border-gray-200 py-8 text-center">
            <p className="text-sm text-gray-400">아직 제출한 사람이 없습니다</p>
            <p className="text-xs text-gray-300 mt-1">내 일정 탭에서 먼저 제출해보세요</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 p-2 overflow-hidden">
            <ChinbaHeatmapGrid
              dates={event.dates}
              heatmap={event.heatmap}
              startHour={event.start_hour}
              endHour={event.end_hour}
              totalParticipants={submittedCount}
            />
          </div>
        )}
      </div>

      {/* Recommended time cards */}
      {event.recommended_times.length > 0 && (
        <div className="mb-2">
          <h3 className="text-xs font-bold text-gray-500 mb-2">추천 시간</h3>
          <div className="flex flex-col gap-2">
            {event.recommended_times.slice(0, 3).map((rec, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2.5 ${
                  rec.all_available
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-amber-50 border border-amber-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiClock
                    size={14}
                    className={rec.all_available ? 'text-emerald-600' : 'text-amber-600'}
                  />
                  <span className={`text-sm font-bold ${rec.all_available ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {formatRecommendedTime(rec)}
                  </span>
                </div>
                <p className={`mt-1 text-xs ${rec.all_available ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {rec.all_available
                    ? `${rec.available_count}명 전원 가능`
                    : `${rec.available_count}/${submittedCount}명 가능`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
