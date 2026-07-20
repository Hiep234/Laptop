import Axios from "axios";
import { TOKEN, USER_LOGIN, LOGOUT_SUCCESS } from "../Utils/Setting/Config";
import { isTokenExpired, getTokenRemainingTime, performLogout } from "../Utils/authUtils";

let logoutTimer = null;
let isLoggingOut = false;

/**
 * Perform auto-logout: clear storage, dispatch Redux action, redirect to home.
 */
const handleAutoLogout = (store) => {
    if (isLoggingOut) return;
    isLoggingOut = true;

    // Clear the scheduled timer if any
    if (logoutTimer) {
        clearTimeout(logoutTimer);
        logoutTimer = null;
    }

    // Clear localStorage
    performLogout();

    // Dispatch Redux logout action
    store.dispatch({ type: LOGOUT_SUCCESS });

    // Redirect to home page
    window.location.href = '/';

    // Reset flag after a short delay to prevent re-entrance
    setTimeout(() => {
        isLoggingOut = false;
    }, 1000);
};

/**
 * Schedule a logout timer based on the token's remaining time.
 * This ensures the user is automatically logged out when the token expires,
 * even if they don't make any API calls.
 */
const scheduleAutoLogout = (store) => {
    // Clear any existing timer
    if (logoutTimer) {
        clearTimeout(logoutTimer);
        logoutTimer = null;
    }

    const remaining = getTokenRemainingTime();

    if (remaining <= 0) {
        // Token already expired
        const token = localStorage.getItem(TOKEN);
        if (token) {
            handleAutoLogout(store);
        }
        return;
    }

    // Schedule logout 1 second before actual expiry to be safe
    const logoutIn = Math.max(remaining - 1000, 0);

    logoutTimer = setTimeout(() => {
        handleAutoLogout(store);
    }, logoutIn);
};

/**
 * Set up Axios response interceptor to catch 401 errors
 * and proactive token expiration timer.
 *
 * Call this once at app startup with the Redux store.
 */
const setupAxiosInterceptors = (store) => {
    // 1) Axios request interceptor: check token before every request
    Axios.interceptors.request.use(
        (config) => {
            // Skip token check for login/register endpoints
            const url = config.url || '';
            if (url.includes('/auth/login') || url.includes('/auth/register')) {
                return config;
            }

            const token = localStorage.getItem(TOKEN);
            if (token && isTokenExpired()) {
                handleAutoLogout(store);
                return Promise.reject(new Error('Token expired'));
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    // 2) Axios response interceptor: catch 401 from server
    Axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                handleAutoLogout(store);
            }
            return Promise.reject(error);
        }
    );

    // 3) Set up proactive logout timer based on token expiry
    scheduleAutoLogout(store);

    // 4) Listen for storage changes (e.g. logout in another tab)
    window.addEventListener('storage', (event) => {
        if (event.key === TOKEN && !event.newValue) {
            handleAutoLogout(store);
        }
        // If token was updated (e.g. re-login), reschedule
        if (event.key === TOKEN && event.newValue) {
            scheduleAutoLogout(store);
        }
    });
};

/**
 * Call this after a successful login to start the auto-logout timer.
 */
export const onLoginSuccess = (store) => {
    scheduleAutoLogout(store);
};

export default setupAxiosInterceptors;
