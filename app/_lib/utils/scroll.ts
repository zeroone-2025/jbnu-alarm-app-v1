/**
 * 부드러운 스크롤 애니메이션으로 상단으로 이동합니다.
 * @param container - 스크롤할 컨테이너 요소. null이면 window 스크롤.
 * @param duration - 애니메이션 지속 시간 (기본값: 2000ms)
 */
export function smoothScrollToTop(container: HTMLElement | null, duration = 2000): void {
  const isWindow = container === null;
  const startPosition = isWindow ? window.scrollY : container!.scrollTop;

  if (startPosition === 0) return;

  let startTime: number | null = null;

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const ease = easeOutCubic(progress);
    const nextScroll = startPosition * (1 - ease);

    if (isWindow) {
      window.scrollTo(0, nextScroll);
    } else {
      container!.scrollTop = nextScroll;
    }

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
}
