import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, Cliente, Profesional } from '../types';
import { authService } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Cliente | Profesional | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Verificar si hay un usuario logueado al iniciar la app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking auth status...');
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      console.log('📱 Stored token:', storedToken ? 'exists' : 'not found');
      console.log('👤 Stored user:', storedUser ? 'exists' : 'not found');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('✅ User authenticated from storage');
      } else {
        console.log('❌ No stored credentials found');
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Auth check completed, loading set to false');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setLoginError(null);
      console.log('🔐 Attempting login for:', email);
      const response = await authService.login(email, password);
      
      if (response && response.data) {
        console.log('✅ Login successful, response data:', response.data);
        const { token, usuario } = response.data;

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(usuario));
        
        setToken(token);
        setUser(usuario);
        console.log('💾 Credentials saved, user state updated.');
        setLoginError(null);
      } else {
         console.error('❌ Login error: Invalid response structure from server.');
         throw new Error('Invalid login response');
      }
    } catch (error: any) {
      const errorMessage = error.response ? error.response.data.mensaje : error.message;
      console.error('❌ Login error:', errorMessage);
      let msg = errorMessage;
      if (
        msg.includes('Credenciales inválidas') ||
        msg.includes('no encontrado') ||
        msg.toLowerCase().includes('contraseña')
      ) {
        msg = 'Email o contraseña incorrectos';
      }
      setLoginError(msg);
      throw error;
    } finally {
      setLoading(false);
      console.log('🏁 Login attempt finished.');
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 [1/5] Iniciando logout...');
      if (token) {
        console.log('  [2/5] Token existe, llamando al servicio de logout del backend...');
        await authService.logout();
        console.log('  [3/5] Llamada al backend completada.');
      } else {
        console.log('  [2/5] No hay token, saltando llamada al backend.');
      }
    } catch (error: any) {
      console.error('❌ Logout error en la llamada al backend:', error.response?.data || error.message);
    } finally {
      console.log('  [4/5] Limpiando datos locales (AsyncStorage y estado)...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
      console.log('✅ [5/5] ¡Logout completado! El estado del usuario debería ser nulo.');
    }
  };

  const register = async (userData: any, tipo: 'cliente' | 'profesional') => {
    try {
      setLoading(true);
      let response;
      
      if (tipo === 'cliente') {
        response = await authService.registerCliente(userData);
      } else {
        response = await authService.registerProfesional(userData);
      }

      if (response.success && response.data) {
        // Opcional: El login se maneja desde el componente ahora
        // await login(userData.email, userData.password);
      }

      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearLoginError = () => setLoginError(null);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    register,
    loading,
    loginError,
    setLoginError,
    clearLoginError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 