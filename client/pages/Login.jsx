import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import { IconUser } from '../components/icons';
import { login } from '../services/authService';
import { getUltimoUsuario, getUltimaFoto } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(() => getUltimoUsuario() || '');
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

  const ultimoUsuario = getUltimoUsuario();
  const ultimaFoto = getUltimaFoto();
  const foto =
    ultimaFoto && ultimoUsuario && usuario.trim().toLowerCase() === ultimoUsuario.toLowerCase() ? ultimaFoto : null;

  const avatar = (
    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white/20 text-white shadow-lg shadow-black/20 ring-2 ring-white/30">
      {foto ? (
        <img src={foto} alt="Foto de perfil" className="h-full w-full object-cover" />
      ) : (
        <IconUser className="h-10 w-10" />
      )}
    </div>
  );

  return (
    <AuthLayout title="Entrar" icon={avatar}>
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
