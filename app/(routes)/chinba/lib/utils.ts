import dayjs from 'dayjs';
import type { DayOfWeek, HeatmapSlot, FreeTimeSlot } from '../types';

/**
 * 시간 슬롯 생성 (30분 단위)
 * @param startHour 시작 시간 (예: 9)
 * @param endHour 종료 시간 (예: 22)
 * @returns 시간 배열 ["09:00", "09:30", "10:00", ...]
 */
export function generateTimeSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < endHour) {
      slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
}

/**
 * ISO string을 화면 표시용으로 변환
 * @param isoString "2024-05-20T10:00:00"
 * @returns { day: "월", time: "10:00", date: "2024-05-20" }
 */
export function formatDateTime(isoString: string): {
  day: DayOfWeek;
  time: string;
  date: string;
} {
  const dt = dayjs(isoString);
  const dayIndex = dt.day(); // 0(일) ~ 6(토)
  const days: DayOfWeek[] = ['일', '월', '화', '수', '목', '금', '토'];
  
  return {
    day: days[dayIndex],
    time: dt.format('HH:mm'),
    date: dt.format('YYYY-MM-DD'),
  };
}

/**
 * 날짜 문자열을 요일로 변환
 * @param dateString "2024-05-20"
 * @returns "월"
 */
export function parseDateString(dateString: string): DayOfWeek {
  const dt = dayjs(dateString);
  const dayIndex = dt.day();
  const days: DayOfWeek[] = ['일', '월', '화', '수', '목', '금', '토'];
  return days[dayIndex];
}

/**
 * 날짜 + 시간 → ISO string 변환
 * @param date "2024-05-20"
 * @param time "10:00"
 * @returns "2024-05-20T10:00:00"
 */
export function toISOString(date: string, time: string): string {
  return `${date}T${time}:00`;
}

/**
 * FREE TIME 계산 (빈 시간 = 아무도 선택하지 않은 시간)
 * @param heatmap 백엔드에서 받은 히트맵 데이터
 * @param dates 이벤트 날짜 배열
 * @param startHour 시작 시간
 * @param endHour 종료 시간
 * @returns 요일별 빈 시간 구간 배열
 */
export function calculateFreeTime(
  heatmap: HeatmapSlot[],
  dates: string[],
  startHour: number,
  endHour: number
): FreeTimeSlot[] {
  const freeTimeSlots: FreeTimeSlot[] = [];
  
  // 각 날짜별로 처리
  dates.forEach((date) => {
    const day = parseDateString(date);
    const timeSlots = generateTimeSlots(startHour, endHour);
    
    // 해당 날짜의 빈 시간 찾기
    const busyTimes = new Set(
      heatmap
        .filter((slot) => slot.dt.startsWith(date))
        .map((slot) => dayjs(slot.dt).format('HH:mm'))
    );
    
    // 연속된 빈 시간을 구간으로 묶기
    let currentStart: string | null = null;
    
    timeSlots.forEach((time, index) => {
      const isBusy = busyTimes.has(time);
      
      if (!isBusy && currentStart === null) {
        // 빈 시간 구간 시작
        currentStart = time;
      } else if (isBusy && currentStart !== null) {
        // 빈 시간 구간 종료
        const endTime = timeSlots[index - 1] || currentStart;
        freeTimeSlots.push({
          day,
          date,
          startTime: currentStart,
          endTime,
          dt: toISOString(date, currentStart),
        });
        currentStart = null;
      }
    });
    
    // 마지막 구간 처리
    if (currentStart !== null) {
      const endTime = timeSlots[timeSlots.length - 1];
      freeTimeSlots.push({
        day,
        date,
        startTime: currentStart,
        endTime,
        dt: toISOString(date, currentStart),
      });
    }
  });
  
  return freeTimeSlots;
}

/**
 * 히트맵 색상 계산
 * @param count 해당 시간에 가능한 사람 수
 * @param totalParticipants 전체 참가자 수
 * @returns Tailwind CSS 클래스
 */
export function getHeatmapColor(count: number, totalParticipants: number): string {
  if (count === 0) return 'bg-slate-800/30';
  
  const ratio = count / totalParticipants;
  
  if (ratio >= 1.0) return 'bg-emerald-400'; // 모두 가능
  if (ratio >= 0.66) return 'bg-emerald-600/70'; // 2/3 이상
  if (ratio >= 0.33) return 'bg-emerald-900/60'; // 1/3 이상
  return 'bg-emerald-900/40'; // 1명 이상
}

/**
 * 특정 시간대로 스크롤
 * @param containerRef 스크롤 컨테이너 ref
 * @param targetDt ISO string
 */
export function scrollToTimeSlot(
  containerRef: React.RefObject<HTMLElement>,
  targetDt: string
): void {
  if (!containerRef.current) return;
  
  const { time } = formatDateTime(targetDt);
  const targetElement = containerRef.current.querySelector(
    `[data-time="${time}"]`
  );
  
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 하이라이트 효과
    targetElement.classList.add('highlight-flash');
    setTimeout(() => {
      targetElement.classList.remove('highlight-flash');
    }, 2000);
  }
}

/**
 * 시간 범위 내의 모든 슬롯 생성
 * @param date 날짜
 * @param startTime 시작 시간
 * @param endTime 종료 시간 (미포함)
 * @returns ISO string 배열
 */
export function generateSlotRange(
  date: string,
  startTime: string,
  endTime: string
): string[] {
  const slots: string[] = [];
  const start = dayjs(`${date}T${startTime}:00`);
  const end = dayjs(`${date}T${endTime}:00`);
  
  let current = start;
  // 종료 시간은 포함하지 않음 (9:00~9:30 = 9:00만 선택)
  while (current.isBefore(end)) {
    slots.push(current.format('YYYY-MM-DDTHH:mm:ss'));
    current = current.add(30, 'minute');
  }
  
  return slots;
}
