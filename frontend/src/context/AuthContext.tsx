import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

interface User {
    id: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    signIn: () => void;
    signOut: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    signIn: () => {},
    signOut: () => {},
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already authenticated
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Try to get user info from the backend
            const response = await fetch(`${API_BASE_URL}/auth/me`);
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async () => {
        try {
            // Get the authorization URL from the backend
            const response = await fetch(`${API_BASE_URL}/auth/login/google`);
            const { authorization_url } = await response.json();
            
            // Redirect to Google OAuth
            window.location.href = authorization_url;
        } catch (error) {
            console.error('Sign in failed:', error);
        }
    };

    const signOut = async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
            });
            setUser(null);
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
} 