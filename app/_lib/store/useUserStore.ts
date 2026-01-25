import { create } from 'zustand';
import type { UserProfile } from '@/_types/user';

interface UserState {
    user: UserProfile | null;
    setUser: (user: UserProfile | null) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
}));
