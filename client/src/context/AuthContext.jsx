import { createContext, useContext, useState, useEffect } from 'react';
// Removed TypeScript type import
import { apiRequest } from '@/services/api';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

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
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
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
    const response = await apiRequest('POST', '/api/auth/login', { email, password, role });
    const data = await response.json();
    
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('jwt_token', data.token);
  };

  const signup = async (userData) => {
    const response = await apiRequest('POST', '/api/auth/signup', userData);
    const data = await response.json();
    
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('jwt_token', data.token);
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
