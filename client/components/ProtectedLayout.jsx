import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { isAuthenticated } from '../utils/auth';

const TITLES = {
  '/': 'Dashboard',
  '/gastos': 'Gastos',
  '/salarios': 'Salários',
  '/categorias': 'Categorias',
  '/conta': 'Minha conta'
};

export default function ProtectedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function handleUnauthorized() {
      navigate('/login', { replace: true });
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <Topbar title={TITLES[location.pathname] || 'Finanças'} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 pb-10 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
