import { createContext, useContext, useMemo, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('vendorbridge_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('vendorbridge_user');
    return stored ? JSON.parse(stored) : null;
  });

  const signIn = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem('vendorbridge_token', data.token);
    localStorage.setItem('vendorbridge_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const signUp = async (payload) => {
    const data = await authService.signup(payload);
    localStorage.setItem('vendorbridge_token', data.token);
    localStorage.setItem('vendorbridge_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const signOut = () => {
    localStorage.removeItem('vendorbridge_token');
    localStorage.removeItem('vendorbridge_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, isAuthenticated: Boolean(token), signIn, signUp, signOut }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);

