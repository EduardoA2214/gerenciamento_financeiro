import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import { registrar } from '../services/authService';

export default function Registrar() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await registrar(usuario, senha);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Comece a organizar suas finanças">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert>{error}</Alert>

        <Input
          id="usuario"
          label="Usuário"
          autoComplete="username"
          minLength={3}
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />

        <Input
          id="senha"
          label="Senha"
          type="password"
          autoComplete="new-password"
          minLength={6}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <Input
          id="confirmarSenha"
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          minLength={6}
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? <Spinner className="border-white/30 border-t-white" /> : 'Criar conta'}
        </Button>

        <p className="text-center text-sm text-ink-muted">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-semibold text-navy-900 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
