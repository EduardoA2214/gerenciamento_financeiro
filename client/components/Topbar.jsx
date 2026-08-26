import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconMenu, IconLogout, IconTrash } from './icons';
import { logout } from '../services/authService';
import { limparDados } from '../services/financeService';
import ConfirmDialog from './ui/ConfirmDialog';

export default function Topbar({ title, onMenuClick }) {
  const navigate = useNavigate();
  const [confirmarLimpar, setConfirmarLimpar] = useState(false);
  const [limpando, setLimpando] = useState(false);
  const [limparError, setLimparError] = useState('');

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  async function handleConfirmLimparDados() {
    setLimparError('');
    setLimpando(true);
    try {
      await limparDados();
      window.dispatchEvent(new CustomEvent('dados:limpos'));
    } catch (err) {
      setLimparError(err.message);
    } finally {
      setLimpando(false);
      setConfirmarLimpar(false);
    }
  }

  return (
    <header className="flex items-center justify-between gap-4 px-4 py-5 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="cursor-pointer rounded-lg p-2 text-ink hover:bg-white lg:hidden"
          aria-label="Abrir menu"
        >
          <IconMenu className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-ink lg:text-3xl">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setConfirmarLimpar(true)}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2
            text-sm font-medium text-ink transition-colors hover:border-critical/30 hover:text-critical"
        >
          <IconTrash className="h-4 w-4" />
          <span className="hidden sm:inline">Limpar dados</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2
            text-sm font-medium text-ink transition-colors hover:border-critical/30 hover:text-critical"
        >
          <IconLogout className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>

      {limparError && (
        <div className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-critical/20 bg-white px-4 py-3 text-sm text-critical shadow-lg lg:right-8">
          {limparError}
        </div>
      )}

      <ConfirmDialog
        open={confirmarLimpar}
        title="Limpar dados"
        message="Isso apaga todo o histórico de gastos e de renda recebida. Categorias e rendas fixas cadastradas não são afetadas. Essa ação não pode ser desfeita."
        confirmLabel="Limpar dados"
        loading={limpando}
        onConfirm={handleConfirmLimparDados}
        onCancel={() => setConfirmarLimpar(false)}
      />
    </header>
  );
}
