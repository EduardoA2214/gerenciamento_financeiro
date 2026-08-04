import { useNavigate } from 'react-router-dom';
import { IconMenu, IconLogout } from './icons';
import { logout } from '../services/authService';

export default function Topbar({ title, onMenuClick }) {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
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
        <h1 className="text-xl font-bold text-ink lg:text-2xl">{title}</h1>
      </div>

      <button
        onClick={handleLogout}
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2
          text-sm font-medium text-ink transition-colors hover:border-critical/30 hover:text-critical"
      >
        <IconLogout className="h-4 w-4" />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </header>
  );
}
