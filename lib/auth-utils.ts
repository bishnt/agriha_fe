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

  // Set in localStorage as backup
  localStorage.setItem(AUTH_TOKEN_COOKIE, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_COOKIE, refreshToken);
  }
};

// Get the auth token from cookies or localStorage
export const getAuthToken = () => {
  return Cookies.get(AUTH_TOKEN_COOKIE) || localStorage.getItem(AUTH_TOKEN_COOKIE);
};

// Get the refresh token from cookies or localStorage
export const getRefreshToken = () => {
  return Cookies.get(REFRESH_TOKEN_COOKIE) || localStorage.getItem(REFRESH_TOKEN_COOKIE);
};

// Clear all auth tokens
export const clearAuthTokens = () => {
  // Clear cookies
  Cookies.remove(AUTH_TOKEN_COOKIE, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_COOKIE, { path: '/' });

  // Clear localStorage
  localStorage.removeItem(AUTH_TOKEN_COOKIE);
  localStorage.removeItem(REFRESH_TOKEN_COOKIE);
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