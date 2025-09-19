import Cookies from 'js-cookie';
import { type NextRequest } from 'next/server';

export const AUTH_TOKEN_COOKIE = 'agriha_token';
export const REFRESH_TOKEN_COOKIE = 'agriha_refresh_token';

// Cookie options
const cookieOptions = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  expires: 7, // 7 days
  path: '/',
};

// Set both tokens in cookies and localStorage for redundancy
export const setAuthTokens = (accessToken: string, refreshToken?: string) => {
  // Set in cookies
  Cookies.set(AUTH_TOKEN_COOKIE, accessToken, cookieOptions);
  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions);
  }

  // Set in localStorage as backup (only on client side)
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_COOKIE, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_COOKIE, refreshToken);
    }
    
    // Dispatch custom event to notify components of auth change
    window.dispatchEvent(new CustomEvent('auth-changed'));
  }
};

// Get the auth token from cookies or localStorage
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return Cookies.get(AUTH_TOKEN_COOKIE) || localStorage.getItem(AUTH_TOKEN_COOKIE);
};

// Get the refresh token from cookies or localStorage
export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return Cookies.get(REFRESH_TOKEN_COOKIE) || localStorage.getItem(REFRESH_TOKEN_COOKIE);
};

// Clear all auth tokens
export const clearAuthTokens = () => {
  // Clear cookies
  Cookies.remove(AUTH_TOKEN_COOKIE, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_COOKIE, { path: '/' });

  // Clear localStorage (only on client side)
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_COOKIE);
    localStorage.removeItem(REFRESH_TOKEN_COOKIE);
    
    // Dispatch custom event to notify components of auth change
    window.dispatchEvent(new CustomEvent('auth-changed'));
  }
};

// Get auth token from request headers or cookies
export const getAuthTokenFromRequest = (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookies = req.cookies;
  return cookies.get(AUTH_TOKEN_COOKIE)?.value;
};