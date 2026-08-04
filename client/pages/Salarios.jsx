import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import { createSalario, listSalarios } from '../services/financeService';
import { formatCurrency, formatDate } from '../utils/format';
import { IconPlus } from '../components/icons';

export default function Salarios() {
  const [salarios, setSalarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      setSalarios(await listSalarios());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const valorNumerico = Number(valor);
    if (!valorNumerico || valorNumerico <= 0) {
      setFormError('Informe um valor maior que zero.');
      return;
    }

    setSubmitting(true);
    try {
      await createSalario(valorNumerico, descricao || undefined);
      setValor('');
      setDescricao('');
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <Card className="p-5 lg:p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Novo salário</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Alert>{formError}</Alert>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="valor"
              label="Valor (R$)"
              type="number"
              min="0.01"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />
            <Input
              id="descricao"
              label="Descrição"
              placeholder="Salário"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={submitting} className="self-start">
            <IconPlus className="h-4 w-4" />
            {submitting ? 'Salvando...' : 'Adicionar salário'}
          </Button>
        </form>
      </Card>

      <Card className="p-5 lg:p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Histórico de salários</h2>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <Alert>{error}</Alert>
        ) : salarios.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">Nenhum salário registrado ainda.</p>
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="py-2 pr-4 font-medium">Descrição</th>
                  <th className="py-2 pr-4 font-medium">Data</th>
                  <th className="py-2 pl-4 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {salarios.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 pr-4 font-medium text-ink">{s.descricao || 'Salário'}</td>
                    <td className="py-3 pr-4 text-ink-muted">{formatDate(s.data)}</td>
                    <td className="py-3 pl-4 text-right font-semibold text-good">{formatCurrency(s.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
