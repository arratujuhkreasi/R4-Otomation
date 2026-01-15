'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name?: string;
    role: string;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setIsLoading(false);
                return;
            }

            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                // Token invalid, try refresh
                await refreshToken();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            clearTokens();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Login failed');
        }

        const tokens: AuthTokens = await res.json();
        saveTokens(tokens);
        await checkAuth();
        router.push('/');
    };

    const register = async (email: string, password: string, name?: string) => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Registration failed');
        }

        // Auto-login after registration
        await login(email, password);
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearTokens();
            setUser(null);
            router.push('/login');
        }
    };

    const refreshToken = async () => {
        try {
            const storedRefreshToken = localStorage.getItem('refreshToken');
            if (!storedRefreshToken) {
                throw new Error('No refresh token');
            }

            const res = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: storedRefreshToken }),
            });

            if (!res.ok) {
                throw new Error('Token refresh failed');
            }

            const tokens: AuthTokens = await res.json();
            saveTokens(tokens);
            await checkAuth();
        } catch (error) {
            clearTokens();
            setUser(null);
            throw error;
        }
    };

    const saveTokens = (tokens: AuthTokens) => {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
    };

    const clearTokens = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
