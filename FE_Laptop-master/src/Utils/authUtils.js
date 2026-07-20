import { TOKEN, USER_LOGIN } from "./Setting/Config";

/**
 * Decode a JWT token payload without external libraries.
 * Returns null if the token is invalid or cannot be parsed.
 */
export const decodeToken = (token) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = parts[1];
        // Base64Url → Base64
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
    }
};

/**
 * Check if the stored JWT token is expired.
 * Returns true if expired or if no token exists.
 */
export const isTokenExpired = () => {
    const token = localStorage.getItem(TOKEN);
    if (!token) return true;

    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    const now = Date.now() / 1000;
    return decoded.exp < now;
};

/**
 * Get the remaining time (in milliseconds) before the token expires.
 * Returns 0 if the token is already expired or invalid.
 */
export const getTokenRemainingTime = () => {
    const token = localStorage.getItem(TOKEN);
    if (!token) return 0;

    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return 0;

    const now = Date.now() / 1000;
    const remaining = decoded.exp - now;
    return remaining > 0 ? remaining * 1000 : 0; // convert to ms
};

/**
 * Clear all auth data from localStorage and dispatch Redux logout.
 */
export const performLogout = () => {
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(USER_LOGIN);
};
