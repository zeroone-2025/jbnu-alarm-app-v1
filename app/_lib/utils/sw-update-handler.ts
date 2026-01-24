/**
 * Service Worker 업데이트 핸들러
 * 새로운 버전의 Service Worker가 감지되면 자동으로 업데이트를 적용합니다.
 */

// 전역 플래그 (함수 외부에 선언하여 재실행 시에도 유지)
let refreshing = false;

export function registerServiceWorkerUpdateHandler() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return;
    }

    // 이미 등록되었으면 중복 실행 방지
    if (refreshing) {
        return;
    }

    // Service Worker 등록 및 업데이트 체크
    navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
            console.log('[SW] Service Worker registered:', registration);

            // 1시간마다 업데이트 체크
            setInterval(() => {
                registration.update();
            }, 60 * 60 * 1000);

            // 새로운 Service Worker가 설치되었을 때
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (!newWorker) return;

                console.log('[SW] New service worker found, installing...');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // 새 버전이 설치되었고, 이전 버전이 아직 실행 중인 경우
                        console.log('[SW] New version available, will reload on next visit');

                        // skipWaiting이 설정되어 있으므로 자동으로 활성화됨
                        // 필요시 사용자에게 알림을 표시할 수 있음
                    }
                });
            });
        })
        .catch((error) => {
            console.error('[SW] Service Worker registration failed:', error);
        });

    // Service Worker가 제어권을 가져갔을 때 (새 버전 활성화)
    // 무한 새로고침 방지를 위해 자동 리로드 제거
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] Controller changed. New version is active.');
        // window.location.reload(); // 무한 루프 위험으로 제거
    });
}

