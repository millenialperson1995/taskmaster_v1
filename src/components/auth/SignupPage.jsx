import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthFormContainer } from './AuthFormContainer';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

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
        } catch (err) {
            setError('Falha ao criar conta. O e-mail pode já estar em uso.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthFormContainer title="Crie sua conta" error={error} onSubmit={handleSubmit}>
            <Input type="text" placeholder="Seu Nome" value={name} onChange={e => setName(e.target.value)} required />
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Senha (mín. 8 caracteres)" value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" disabled={loading} size="lg">
                {loading ? "Criando..." : "Criar Conta"}
            </Button>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Já tem uma conta?{' '}
                <button type="button" onClick={() => setAuthView('login')} className="font-semibold text-blue-600 hover:underline">
                    Faça login
                </button>
            </p>
        </AuthFormContainer>
    );
};