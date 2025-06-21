import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthFormContainer } from './AuthFormContainer';

export const SignupPage = ({ setAuthView }) => {
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signup(email, password, name);
             // O sucesso é tratado pelo AuthContext
        } catch (err) {
            setError('Falha ao criar conta. O e-mail pode já estar em uso.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthFormContainer title="Crie sua conta" error={error} onSubmit={handleSubmit}>
            <input type="text" placeholder="Seu Nome" value={name} onChange={e => setName(e.target.value)} className="p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full" required />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full" required />
            <input type="password" placeholder="Senha (mín. 8 caracteres)" value={password} onChange={e => setPassword(e.target.value)} className="p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md w-full" required />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors">{loading ? "Criando..." : "Criar Conta"}</button>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Já tem uma conta?{' '}
                <button type="button" onClick={() => setAuthView('login')} className="font-semibold text-blue-600 hover:underline">Faça login</button>
            </p>
        </AuthFormContainer>
    );
};