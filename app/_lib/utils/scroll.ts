export type ScrollToTopOptions = {
  container?: HTMLElement | null;
  duration?: number;
  onComplete?: () => void;
};

export const scrollToTop = ({
  container,
  duration = 2000,
  onComplete,
}: ScrollToTopOptions = {}) => {
  if (typeof window === 'undefined') return;

  const isWindow = !container;
  const startPosition = isWindow ? window.scrollY : container.scrollTop;

  if (startPosition === 0) {
    onComplete?.();
    return;
  }

  const supportsSmoothScroll =
    typeof document !== 'undefined' && 'scrollBehavior' in document.documentElement.style;

  if (supportsSmoothScroll) {
    if (isWindow) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (onComplete) {
      window.setTimeout(onComplete, duration);
    }
    return;
  }

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
      container.scrollTop = nextScroll;
    }

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      onComplete?.();
    }
  };

  requestAnimationFrame(animation);
};
