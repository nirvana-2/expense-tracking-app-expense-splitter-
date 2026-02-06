import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Assuming there's a route to get current user info, usually /auth/me or verify
                    // Since I don't see one in the file list previously, I might need to verify token or just decode.
                    // For now, let's assume we store user info in localStorage too to save a request, 
                    // or verify if backend has a /me route.
                    // Looking at file list: authController.js likely has login/register.
                    // I will check authController before fully committing to this logic.
                    // For now, naive implementation:
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                } catch (error) {
                    console.error('Auth check failed', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            // Destructure exactly what the backend sends
            const { token, ...userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData); // Now user is an object, not undefined!
            toast.success('Login successful!');
            return true
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const register = async (name, email, password, phoneNumber) => {
        try {
            await api.post('/auth/register', { name, email, password, phoneNumber });
            toast.success('Registration successful! Please login.');
            return true; // Redirect to login
        } catch (error) {
            console.error('Registration error:', error);
            console.error("Error response:", error.response?.data);
            const errorMessage = error.response?.data?.errors?.[0]?.msg
                || error.response?.data?.message
                || 'Registration failed';

            toast.error(errorMessage);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.info('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
