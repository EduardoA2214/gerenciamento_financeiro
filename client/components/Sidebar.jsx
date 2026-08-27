import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getUsuario, getFoto } from '../utils/auth';
import { logout } from '../services/authService';
import { IconHome, IconWallet, IconBanknote, IconTag, IconLogout, IconUser, IconSettings } from './icons';

const navItems = [
  { to: '/', label: 'Dashboard', icon: IconHome, end: true },
  { to: '/gastos', label: 'Gastos', icon: IconWallet },
  { to: '/renda', label: 'Renda', icon: IconBanknote },
  { to: '/categorias', label: 'Categorias', icon: IconTag }
];

export default function Sidebar({ open, onNavigate }) {
  const navigate = useNavigate();
  const usuario = getUsuario();
  const [foto, setFotoState] = useState(getFoto());

  useEffect(() => {
    function handleProfileUpdated() {
      setFotoState(getFoto());
    }
    window.addEventListener('auth:profile-updated', handleProfileUpdated);
    return () => window.removeEventListener('auth:profile-updated', handleProfileUpdated);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-gradient-to-b from-navy-700 to-brand-orange text-white
        transition-transform duration-200 lg:static lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex flex-col items-center gap-3 border-b border-white/10 px-6 py-8">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/20 text-white ring-2 ring-white/30">
          {foto ? (
            <img src={foto} alt="Foto de perfil" className="h-full w-full object-cover" />
          ) : (
            <IconUser className="h-8 w-8" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold capitalize">{usuario || 'Usuário'}</p>
          <p className="text-xs text-white/50">Controle financeiro</p>
        </div>
        <NavLink
          to="/conta"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <IconSettings className="h-3.5 w-3.5" />
          Gerenciar minha conta
        </NavLink>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-white text-navy-900 shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium
            text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <IconLogout className="h-4.5 w-4.5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
