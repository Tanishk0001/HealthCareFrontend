import { createContext, useContext, useEffect, useState } from 'react';
// Removed TypeScript type import
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/services/api';
import { useLocation } from 'wouter';

// JavaScript - no interface definitions needed

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const savedToken = localStorage.getItem('jwt_token');
    if (savedToken) {
      setToken(savedToken);
      fetchCurrentUser(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken) => {
    try {
      try {
        const response = await apiRequest('GET', '/api/auth/me');
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        localStorage.removeItem('jwt_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      localStorage.removeItem('jwt_token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password, role) => {
    // role should be 'patient' or 'doctor'
    const path = role === 'doctor' ? '/api/auth/login/doctor' : '/api/auth/login/patient';
    try {
      const response = await apiRequest('POST', path, { email, password });
      const data = await response.json();

      // Persist token first so subsequent requests (e.g., /me) include it
      localStorage.setItem('jwt_token', data.token);
      setToken(data.token);

      // Fetch full user profile
      await fetchCurrentUser(data.token);
    } catch (err) {
      throw new Error(err.message || 'Login failed');
    }
  };

  const signup = async (userData) => {
    // Expect userData.role to be 'doctor' or 'patient'
    const path = userData.role === 'doctor' ? '/api/auth/signup/doctor' : '/api/auth/signup/patient';
    // Build backend-ready payload
    const payload = {
      name: `${userData.firstName ? userData.firstName + ' ' : ''}${userData.lastName ? userData.lastName : ''}`.trim(),
      email: userData.email,
      password: userData.password,
      role: userData.role,
    };

    // include optional fields where present
    if (userData.age) payload.age = userData.age;
    if (userData.gender) payload.gender = userData.gender;
    if (userData.phone) payload.phone = userData.phone;
    if (userData.specialization) payload.specialization = userData.specialization;

    try {
      const response = await apiRequest('POST', path, payload);
      const data = await response.json();

      // If backend returned a token and user, use them to auto-login without an extra request
      if (data && data.token && data.user) {
        localStorage.setItem('jwt_token', data.token);
        setToken(data.token);
        setUser(data.user);
      } else if (userData.email && userData.password) {
        // fallback to calling login
        await login(userData.email, userData.password, userData.role);
      }

      return data;
    } catch (err) {
      throw new Error(err.message || 'Signup failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jwt_token');
    
    // Redirect to homepage
    setLocation('/');
    
    // Show success message
    toast({
      title: "Successfully logged out",
      description: "You have been logged out successfully. Thank you for using our platform!",
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
