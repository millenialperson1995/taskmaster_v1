import { createContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  checkUserSession,
  loginUser,
  signupUser,
  logoutUser,
} from '../api/appwrite';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // Query para buscar o usuário logado.
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: checkUserSession,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Mutação para login
  const { mutate: login, isPending: isLoggingIn } = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success(`Bem-vindo(a) de volta!`);
    },
    // O tratamento de erro foi movido para o componente para exibir na UI
  });

  // Mutação para cadastro, com auto-login corrigido
  const { mutate: signup, isPending: isSigningUp } = useMutation({
    mutationFn: signupUser,
    onSuccess: async (newUser, variables) => {
      // CORREÇÃO: Usamos a senha das 'variables' da mutação para o auto-login.
      await loginUser({ email: newUser.email, password: variables.password });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Conta criada com sucesso!');
    },
  });

  // Mutação para logout
  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao fazer logout.');
    },
  });

  const value = {
    currentUser,
    // Unifica todos os estados de carregamento em um único booleano
    isLoading: isLoadingUser || isLoggingIn || isSigningUp || isLoggingOut,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};