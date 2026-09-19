import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../Library/Axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  
  // Clear localStorage on app start if corrupted
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    
    if (token && !storedUser) {
      // Token exists but no user data - clear everything
      localStorage.removeItem('token');
    }
    
    if (storedUser && !token) {
      // User data exists but no token - clear everything
      localStorage.removeItem('user');
    }
  }, []);

  // Role hierarchy for permission checking
  const roleHierarchy = {
    admin: 3,
    accountant: 2,
    staff: 1
  };

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      // Set token in axios headers immediately
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Add a small delay to ensure localStorage operations are complete
    setTimeout(() => {
      checkAuthStatus();
    }, 100);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      
      if (token && storedUser) {
        // Set user from localStorage first for immediate auth
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (parseError) {
          logout();
          return;
        }
        
        // Then verify token with backend
        try {
          const response = await axiosInstance.get('/auth/me');
          
          if (response.data.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            logout();
          }
        } catch (verifyError) {
          logout();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store token and set axios header
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state immediately
        setUser(user);
        setIsAuthenticated(true);
        setLoading(false);
        
        return { success: true, user, token };
      } else {
        return { success: false, error: response.data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (requiredRole) => {
    if (!user || !user.role) return false;
    
    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
  };

  const canManageUsers = () => {
    return hasPermission('admin');
  };

  const canManageCategories = () => {
    return hasPermission('accountant');
  };

  const canViewReports = () => {
    return hasPermission('accountant');
  };

  const canAddExpenses = () => {
    return hasPermission('staff');
  };

  const canAddSales = () => {
    return hasPermission('staff');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
    roleHierarchy,
    hasRole: (requiredRole) => {
      if (!user || !user.role) return false;
      return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    }
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
