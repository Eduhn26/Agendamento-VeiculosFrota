import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      authAPI.defaults.headers.Authorization = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔄 Tentando login com:', email);

   
      const response = await authAPI.post('/login', {  
        email, 
        password 
      });

      const { token, user: userData } = response.data;

      if (!token || !userData) {
        throw new Error('Resposta inválida do servidor');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      authAPI.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(userData);

      console.log('✅ Login bem-sucedido:', userData.name);
      return { success: true, user: userData };

    } catch (error) {
      console.error('❌ Erro no login:', error);

      let errorMessage = 'Erro no servidor';

      if (error.response) {
        errorMessage = error.response.data?.error || `Erro ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Servidor não respondeu. Verifique se o backend está rodando.';
      } else {
        errorMessage = error.message;
      }

      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete authAPI.defaults.headers.Authorization;
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
