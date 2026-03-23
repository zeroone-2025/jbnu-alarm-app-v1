/**
 * 플랫폼 분기 저장소 유틸리티
 *
 * - 일반 데이터: Native → @capacitor/preferences / Web → localStorage
 * - 토큰 전용: Native → capacitor-secure-storage-plugin (iOS Keychain) / Web → 메모리만
 * - getSync(key): 내부 메모리 캐시에서 동기 읽기 (기존 localStorage 동기 패턴 호환)
 * - init(): 앱 시작 시 등록된 키를 메모리에 프리로드
 * - migrateFromLocalStorage(keys): localStorage → Preferences 1회 마이그레이션
 */

// 메모리 캐시 (getSync 지원용)
const memoryCache: Record<string, string> = {};

// 등록된 키 목록 (init() 시 프리로드할 키)
const registeredKeys: Set<string> = new Set();

function isNative(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        // 동적 import를 사용할 수 없는 동기 컨텍스트에서는
        // window.__capacitor__ 존재 여부로 판단
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cap = (window as any).Capacitor;
        return cap?.isNativePlatform?.() ?? false;
    } catch {
        return false;
    }
}

// ─────────────────────────────────────────────
// 일반 스토리지 (Preferences / localStorage)
// ─────────────────────────────────────────────

export async function get(key: string): Promise<string | null> {
    if (isNative()) {
        const { Preferences } = await import('@capacitor/preferences');
        const { value } = await Preferences.get({ key });
        if (value !== null) {
            memoryCache[key] = value;
        } else {
            delete memoryCache[key];
        }
        return value;
    }
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem(key);
    if (value !== null) {
        memoryCache[key] = value;
    } else {
        delete memoryCache[key];
    }
    return value;
}

export async function set(key: string, value: string): Promise<void> {
    memoryCache[key] = value;
    if (isNative()) {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.set({ key, value });
        return;
    }
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
    }
}

export async function remove(key: string): Promise<void> {
    delete memoryCache[key];
    if (isNative()) {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.remove({ key });
        return;
    }
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
    }
}

// ─────────────────────────────────────────────
// 보안 스토리지 (Keychain / 메모리)
// ─────────────────────────────────────────────

const SECURE_MEMORY_PREFIX = '__secure__';

export async function getSecure(key: string): Promise<string | null> {
    if (isNative()) {
        try {
            const { SecureStoragePlugin } = await import('capacitor-secure-storage-plugin');
            const { value } = await SecureStoragePlugin.get({ key });
            if (value) {
                memoryCache[SECURE_MEMORY_PREFIX + key] = value;
            }
            return value ?? null;
        } catch {
            // 키가 없으면 예외 발생 → null 반환
            delete memoryCache[SECURE_MEMORY_PREFIX + key];
            return null;
        }
    }
    // Web: 메모리에서만 읽기
    return memoryCache[SECURE_MEMORY_PREFIX + key] ?? null;
}

export async function setSecure(key: string, value: string): Promise<void> {
    memoryCache[SECURE_MEMORY_PREFIX + key] = value;
    if (isNative()) {
        const { SecureStoragePlugin } = await import('capacitor-secure-storage-plugin');
        await SecureStoragePlugin.set({ key, value });
    }
    // Web: 메모리에만 저장 (이미 위에서 처리)
}

export async function removeSecure(key: string): Promise<void> {
    delete memoryCache[SECURE_MEMORY_PREFIX + key];
    if (isNative()) {
        try {
            const { SecureStoragePlugin } = await import('capacitor-secure-storage-plugin');
            await SecureStoragePlugin.remove({ key });
        } catch {
            // 키가 없어도 무시
        }
    }
}

// ─────────────────────────────────────────────
// 동기 읽기 (메모리 캐시 기반)
// ─────────────────────────────────────────────

export function getSync(key: string): string | null {
    return memoryCache[key] ?? null;
}

// ─────────────────────────────────────────────
// 초기화: 등록된 키를 메모리에 프리로드
// ─────────────────────────────────────────────

/**
 * 앱 시작 시 호출. 등록된 키를 모두 메모리 캐시에 로드.
 * providers.tsx의 AuthInitializer에서 initializeAuth() 전에 호출해야 함.
 */
export async function init(keysToLoad: string[] = []): Promise<void> {
    if (typeof window === 'undefined') return;

    const keys = keysToLoad.length > 0 ? keysToLoad : Array.from(registeredKeys);

    await Promise.all(
        keys.map(async (key) => {
            registeredKeys.add(key);
            await get(key); // 값을 읽어 memoryCache에 저장
        })
    );
}

// ─────────────────────────────────────────────
// localStorage → Preferences 마이그레이션
// ─────────────────────────────────────────────

/**
 * localStorage 값을 Preferences로 1회 마이그레이션.
 * Preferences에 이미 값이 있으면 덮어쓰지 않음 (Preferences 우선).
 * init() 호출 이후에 실행해야 함.
 */
export async function migrateFromLocalStorage(keys: string[]): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!isNative()) return; // Web에서는 이미 localStorage 사용 중이므로 불필요

    await Promise.all(
        keys.map(async (key) => {
            // Preferences에 이미 값이 있으면 스킵 (Preferences 우선)
            const { Preferences } = await import('@capacitor/preferences');
            const { value: existingValue } = await Preferences.get({ key });
            if (existingValue !== null) {
                // Preferences 값을 캐시에 반영
                memoryCache[key] = existingValue;
                return;
            }

            // localStorage에서 값을 읽어 Preferences로 이동
            const localValue = localStorage.getItem(key);
            if (localValue !== null) {
                await Preferences.set({ key, value: localValue });
                memoryCache[key] = localValue;
                // 마이그레이션 후 localStorage에서 제거하지 않음
                // (하위 호환성을 위해 localStorage는 유지)
            }
        })
    );
}

const persistentStorage = {
    get,
    set,
    remove,
    getSecure,
    setSecure,
    removeSecure,
    getSync,
    init,
    migrateFromLocalStorage,
};

export default persistentStorage;
