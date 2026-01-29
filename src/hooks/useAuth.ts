import { useState, useEffect, useCallback } from 'react';

// SHA-256 hash function using Web Crypto API
async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Session storage key
const SESSION_KEY = 'niems_auth_session';
const SESSION_EXPIRY_KEY = 'niems_auth_expiry';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface UseAuthReturn extends AuthState {
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}

export function useAuth(): UseAuthReturn {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    // Check existing session on mount
    useEffect(() => {
        const checkSession = () => {
            const session = localStorage.getItem(SESSION_KEY);
            const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);

            if (session && expiry) {
                const expiryTime = parseInt(expiry, 10);
                if (Date.now() < expiryTime) {
                    setState({ isAuthenticated: true, isLoading: false, error: null });
                    return;
                }
                // Session expired, clean up
                localStorage.removeItem(SESSION_KEY);
                localStorage.removeItem(SESSION_EXPIRY_KEY);
            }

            setState({ isAuthenticated: false, isLoading: false, error: null });
        };

        checkSession();
    }, []);

    const login = useCallback(async (username: string, password: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Get expected credentials from environment variables
            const expectedUsername = import.meta.env.VITE_AUTH_USERNAME || 'admin';
            const expectedPasswordHash = import.meta.env.VITE_AUTH_PASSWORD_HASH || '';

            // Hash the provided password
            const passwordHash = await sha256(password);

            // Validate credentials
            if (username === expectedUsername && passwordHash === expectedPasswordHash) {
                // Store session
                const expiryTime = Date.now() + SESSION_DURATION;
                localStorage.setItem(SESSION_KEY, 'active');
                localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());

                setState({ isAuthenticated: true, isLoading: false, error: null });
                return true;
            }

            setState({
                isAuthenticated: false,
                isLoading: false,
                error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
            });
            return false;
        } catch {
            setState({
                isAuthenticated: false,
                isLoading: false,
                error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
            });
            return false;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_EXPIRY_KEY);
        setState({ isAuthenticated: false, isLoading: false, error: null });
    }, []);

    return {
        ...state,
        login,
        logout,
    };
}
