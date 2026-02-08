import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
    name: string;
    email: string;
    money: number;
    trust: number;
    pvt_cards: number;
    loan: number;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<{ error?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persisted user email
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
            refreshUser(storedEmail);
        } else {
            setIsLoading(false);
        }
    }, []);

    const refreshUser = async (email?: string) => {
        const targetEmail = email || user?.email;
        if (!targetEmail) {
            setIsLoading(false);
            return;
        }

        try {
            const userData = await api.getUser(targetEmail);
            if (userData && !userData.error) {
                setUser(userData);
            } else {
                // User doesn't exist anymore, clear storage
                console.log('User not found in database, clearing localStorage');
                localStorage.removeItem('userEmail');
                setUser(null);
            }
        } catch (err) {
            console.error('Failed to refresh user', err);
            // On error, clear user state and localStorage
            localStorage.removeItem('userEmail');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const data = await api.login(email, password);
            if (data.error) {
                return { error: data.error };
            }
            setUser(data);
            localStorage.setItem('userEmail', email);
            if (data.access_token) {
                localStorage.setItem('accessToken', data.access_token);
            }
            return {};
        } catch (err) {
            return { error: 'Connection failed' };
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const data = await api.register(name, email, password);
            if (data.error) {
                return { error: data.error };
            }
            // Auto login after register? Or just return success
            return {};
        } catch (err) {
            return { error: 'Connection failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userEmail');
        localStorage.removeItem('accessToken');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
