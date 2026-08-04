import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import { login } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(usuario, senha);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Entrar" subtitle="Acesse seu painel financeiro">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert>{error}</Alert>

        <Input
          id="usuario"
          label="Usuário"
          autoComplete="username"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />

        <Input
          id="senha"
          label="Senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? <Spinner className="border-white/30 border-t-white" /> : 'Entrar'}
        </Button>

        <p className="text-center text-sm text-ink-muted">
          Não tem uma conta?{' '}
          <Link to="/registrar" className="font-semibold text-navy-900 hover:underline">
            Criar conta
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
