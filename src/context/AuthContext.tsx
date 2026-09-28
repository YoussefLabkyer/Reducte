import React, { createContext, useContext, useState, useEffect } from 'react';
import { UtilisateurDTO, Client } from '../types';
import { authService } from '../services/authService';
import { getStoredToken, setStoredToken, removeStoredToken } from '../services/api';

interface AuthContextType {
  user: UtilisateurDTO | null;
  client: Client | null;
  loading: boolean;
  login: (email: string, motDePasse: string) => Promise<void>;
  register: (data: any) => Promise<{ message: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UtilisateurDTO | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setClient(null);
      setLoading(false);
      return;
    }

    try {
      const data = await authService.me();
      setUser(data.user);
      setClient(data.client || null);
    } catch (err) {
      removeStoredToken();
      setUser(null);
      setClient(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, motDePasse: string) => {
    const response = await authService.login(email, motDePasse);
    setStoredToken(response.token);
    setUser(response.user);
    setClient(response.client || null);
  };

  const register = async (data: any) => {
    return authService.register(data);
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
    setClient(null);
  };

  return (
    <AuthContext.Provider value={{ user, client, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l intérieur d un AuthProvider');
  }
  return context;
};
