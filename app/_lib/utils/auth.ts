/**
 * Authentication utility functions
 */

/**
 * Check if user is logged in by checking for access token
 * @returns true if user is logged in, false otherwise
 */
export const isUserLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
};
