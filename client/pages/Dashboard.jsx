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

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [resumoData, gastosData, salariosData] = await Promise.all([
          getResumo(),
          listGastos(),
          listSalarios()
        ]);
        if (!active) return;
        setResumo(resumoData);
        setGastos(gastosData);
        setSalarios(salariosData);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Saldo" value={formatCurrency(resumo.saldo)} icon={IconTrendUp} highlight />
        <StatCard label="Salários" value={formatCurrency(resumo.totalSalario)} icon={IconBanknote} />
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
