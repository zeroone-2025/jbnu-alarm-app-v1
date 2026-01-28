'use client';

import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Providers wrapper component
 * Provides context for the app including authentication state
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
