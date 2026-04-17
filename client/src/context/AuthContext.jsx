/**
 * AuthContext
 * Global authentication state management
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from 'services/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Restore session on mount ──────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await api.get('/auth/profile');
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: data.user, token },
        });
      } catch {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    restoreSession();
  }, []);

  // ── Login ─────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  // ── Signup ────────────────────────────────────────────────────
  const signup = useCallback(async (name, email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await api.post('/auth/signup', { name, email, password });
      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Signup failed. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  }, []);

  // ── Update user ───────────────────────────────────────────────
  const updateUser = useCallback((updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, []);

  const value = {
    ...state,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
