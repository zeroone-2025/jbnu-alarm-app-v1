'use client';

/**
 * Providers wrapper component
 * Currently no providers are needed, but kept for future extensibility
 * (e.g., theme provider, query client, etc.)
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
