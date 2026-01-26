'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import { IUser } from '@/lib/interface';

interface AuthContextType {
  currentUser: IUser | null;
  users: IUser[];
  loading: boolean;
  setCurrentUser: (user: IUser | null) => void;
  loadUsers: () => Promise<void>;
  createUser: (data: { email: string; name: string; password: string }) => Promise<IUser>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar usuários do localStorage na inicialização
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Tentar carregar do localStorage primeiro
        const savedUser = localStorage.getItem('motoFinance_currentUser');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
        
        // Carregar lista de usuários
        await loadUsers();
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await apiClient.getUsers();
      setUsers(response.data);
      
      // Salvar no localStorage
      localStorage.setItem('motoFinance_users', JSON.stringify(response.data));
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      // Usar dados do localStorage como fallback
      const savedUsers = localStorage.getItem('motoFinance_users');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      }
    }
  };

  const createUser = async (data: { email: string; name: string; password: string }) => {
    const response = await apiClient.createUser(data);
    await loadUsers(); // Recarregar lista de usuários
    return response.data;
  };

  // Salvar usuário atual no localStorage quando mudar
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('motoFinance_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('motoFinance_currentUser');
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      loading,
      setCurrentUser,
      loadUsers,
      createUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}