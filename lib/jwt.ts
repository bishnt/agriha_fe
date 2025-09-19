export function decodeJwt(token: string): { userId: number; exp: number } | null {
  try {
    if (!token || token.split('.').length !== 3) {
      return null;
    }
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    let jsonPayload: string;
    try {
      // Try direct atob first (for our mock tokens)
      jsonPayload = atob(base64);
    } catch {
      // If that fails, try the URI decoding method
      jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    }

    const payload = JSON.parse(jsonPayload);
    
    // Ensure we have the required fields
    if (typeof payload.userId === 'number' && typeof payload.exp === 'number') {
      return payload;
    } else {
      return null;
    }
  } catch (e) {
    console.error('Error decoding JWT:', e);
    return null;
  }
}
