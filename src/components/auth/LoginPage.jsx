import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthFormContainer } from './AuthFormContainer';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AppwriteException } from 'appwrite';

export const LoginPage = ({ setAuthView }) => {
    // A função 'login' vem da mutação do React Query
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // CORREÇÃO: Passamos um único objeto para a função 'login'
        login({ email, password }, {
            onError: (err) => {
                if (err instanceof AppwriteException) {
                    switch (err.code) {
                        case 400:
                        case 401:
                            setError('E-mail ou senha inválidos. Tente novamente.');
                            break;
                        default:
                            setError('Ocorreu um erro. Por favor, tente mais tarde.');
                            break;
                    }
                } else {
                    setError('Ocorreu um erro inesperado.');
                }
            }
        });
    };

    return (
        <AuthFormContainer title="Acessar sua conta" error={error} onSubmit={handleSubmit}>
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Não tem uma conta?{' '}
                <button type="button" onClick={() => setAuthView('signup')} className="font-semibold text-blue-600 hover:underline">
                    Cadastre-se
                </button>
            </p>
        </AuthFormContainer>
    );
};