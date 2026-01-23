/**
 * Authentication utility functions
 */

import { getAccessToken } from '@/api';

/**
 * Check if user is logged in by checking for access token in memory
 * @returns true if user is logged in, false otherwise
 */
export const isUserLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!getAccessToken();
};
