import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthFormContainer } from './AuthFormContainer';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const LoginPage = ({ setAuthView }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError('Falha ao fazer login. Verifique seu e-mail e senha.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthFormContainer title="Acessar sua conta" error={error} onSubmit={handleSubmit}>
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" disabled={loading} size="lg">
                {loading ? "Entrando..." : "Entrar"}
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