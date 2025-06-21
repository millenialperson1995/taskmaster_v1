import { createContext, useState, useEffect } from 'react';
import { AppwriteException } from 'appwrite';
import { account, ID } from '../api/appwrite';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await account.get();
        setCurrentUser(user);
      } catch (e) {
        // Agora 'e instanceof AppwriteException' funcionará corretamente
        if (e instanceof AppwriteException && e.code !== 401) {
          console.error("Erro ao verificar sessão:", e);
        }
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    setCurrentUser(user);
  };

  const signup = async (email, password, name) => {
    await account.create(ID.unique(), email, password, name);
    await login(email, password); // Auto-login after signup
  };

  const logout = async () => {
    await account.deleteSession('current');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};