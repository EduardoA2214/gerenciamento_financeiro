import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import ExpensesBarChart from '../components/charts/ExpensesBarChart';
import SpendingDonut from '../components/charts/SpendingDonut';
import RecentTransactions from '../components/RecentTransactions';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import { getResumo, listGastos, listSalarios } from '../services/financeService';
import { formatCurrency } from '../utils/format';
import { IconBanknote, IconWallet, IconTrendUp, IconTag } from '../components/icons';

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [salarios, setSalarios] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setError('');
    try {
      const [resumoData, gastosData, salariosData] = await Promise.all([
        getResumo(),
        listGastos(),
        listSalarios()
      ]);
      setResumo(resumoData);
      setGastos(gastosData);
      setSalarios(salariosData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    function handleDadosLimpos() {
      load();
    }
    window.addEventListener('dados:limpos', handleDadosLimpos);
    return () => window.removeEventListener('dados:limpos', handleDadosLimpos);
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-4">
        <Alert>{error}</Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">Visão geral</p>
        <p className="mt-1 text-sm text-ink-muted">Seu resumo financeiro, atualizado em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Saldo" value={formatCurrency(resumo.saldo)} icon={IconTrendUp} highlight />
        <StatCard label="Renda" value={formatCurrency(resumo.totalSalario)} icon={IconBanknote} />
        <StatCard label="Gastos" value={formatCurrency(resumo.totalGastos)} icon={IconWallet} />
        <StatCard label="Qtd. de gastos" value={resumo.quantidadeDeGastos} icon={IconTag} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ExpensesBarChart gastosPorCategoria={resumo.gastosPorCategoria} />
        </div>
        <div className="lg:col-span-2">
          <SpendingDonut totalSalario={resumo.totalSalario} totalGastos={resumo.totalGastos} saldo={resumo.saldo} />
        </div>
      </div>

      <RecentTransactions gastos={gastos} salarios={salarios} />
    </div>
  );
}
