import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthFormContainer } from './AuthFormContainer';

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
            // O sucesso é tratado pelo AuthContext
        } catch (err) {
            setError('Falha ao fazer login. Verifique seu e-mail e senha.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthFormContainer title="Acessar sua conta" error={error} onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full" required />
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full" required />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors">{loading ? "Entrando..." : "Entrar"}</button>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Não tem uma conta?{' '}
                <button type="button" onClick={() => setAuthView('signup')} className="font-semibold text-blue-600 hover:underline">Cadastre-se</button>
            </p>
        </AuthFormContainer>
    );
};