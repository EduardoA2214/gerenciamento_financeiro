import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedLayout from './components/ProtectedLayout';
import Login from './pages/Login';
import Registrar from './pages/Registrar';
import Dashboard from './pages/Dashboard';
import Gastos from './pages/Gastos';
import Renda from './pages/Renda';
import Categorias from './pages/Categorias';
import Conta from './pages/Conta';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />

        <Route element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/renda" element={<Renda />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/conta" element={<Conta />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
