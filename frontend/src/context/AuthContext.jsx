import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('fastor_auth_token') || null;
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('fastor_user_data');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Track phone number entered during registration to display on OTP screen
  const [pendingPhone, setPendingPhone] = useState(() => {
    return localStorage.getItem('fastor_pending_phone') || '9876543210';
  });

  const [pendingDialCode, setPendingDialCode] = useState(() => {
    return localStorage.getItem('fastor_pending_dial_code') || '+91';
  });

  const setRegistrationInfo = (phone, dialCode = '+91') => {
    setPendingPhone(phone);
    setPendingDialCode(dialCode);
    localStorage.setItem('fastor_pending_phone', phone);
    localStorage.setItem('fastor_pending_dial_code', dialCode);
  };

  const login = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('fastor_auth_token', authToken);
    if (userData) {
      localStorage.setItem('fastor_user_data', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fastor_auth_token');
    localStorage.removeItem('fastor_user_data');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        pendingPhone,
        pendingDialCode,
        setRegistrationInfo,
        login,
        logout,
      }}
    >
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
