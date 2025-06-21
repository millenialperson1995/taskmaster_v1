import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthFormContainer } from './AuthFormContainer';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AppwriteException } from 'appwrite'; // CORRIGIDO: Importado de 'appwrite'

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
             if (err instanceof AppwriteException) {
                switch (err.code) {
                    case 400:
                        setError('Dados inválidos. A senha deve ter no mínimo 8 caracteres.');
                        break;
                    case 409:
                        setError('Este e-mail já está em uso por outra conta.');
                        break;
                    default:
                        setError('Ocorreu um erro ao criar a conta.');
                        break;
                }
            } else {
                setError('Ocorreu um erro inesperado.');
            }
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