import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { createGasto, deleteGasto, listCategorias, listGastos } from '../services/financeService';
import { formatCurrency, formatDate } from '../utils/format';
import { IconPlus, IconTrash } from '../components/icons';

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [gastoParaExcluir, setGastoParaExcluir] = useState(null);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [gastosData, categoriasData] = await Promise.all([listGastos(), listCategorias()]);
      setGastos(gastosData);
      setCategorias(categoriasData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    function handleDadosLimpos() {
      loadData();
    }
    window.addEventListener('dados:limpos', handleDadosLimpos);
    return () => window.removeEventListener('dados:limpos', handleDadosLimpos);
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
      await createGasto(valorNumerico, descricao, categoria || undefined);
      setValor('');
      setDescricao('');
      setCategoria('');
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(gasto) {
    setGastoParaExcluir(gasto);
  }

  async function handleConfirmDelete() {
    const gasto = gastoParaExcluir;
    if (!gasto) return;

    setError('');
    setDeletingId(gasto.id);
    try {
      await deleteGasto(gasto.id);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
      setGastoParaExcluir(null);
    }
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <Card className="p-5 lg:p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Novo gasto</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Alert>{formError}</Alert>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
            <div>
              <Input
                id="categoria"
                label="Categoria"
                list="categorias-list"
                placeholder="Outros"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              />
              <datalist id="categorias-list">
                {categorias.map((c) => (
                  <option key={c.id} value={c.nome} />
                ))}
              </datalist>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="self-start">
            <IconPlus className="h-4 w-4" />
            {submitting ? 'Salvando...' : 'Adicionar gasto'}
          </Button>
        </form>
      </Card>

      <Card className="p-5 lg:p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Histórico de gastos</h2>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <Alert>{error}</Alert>
        ) : gastos.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">Nenhum gasto registrado ainda.</p>
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="py-2 pr-4 font-medium">Descrição</th>
                  <th className="py-2 pr-4 font-medium">Categoria</th>
                  <th className="py-2 pr-4 font-medium">Data</th>
                  <th className="py-2 pl-4 text-right font-medium">Valor</th>
                  <th className="py-2 pl-4 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {gastos.map((g) => (
                  <tr key={g.id}>
                    <td className="py-3 pr-4 font-medium text-ink">{g.descricao}</td>
                    <td className="py-3 pr-4 text-ink-muted">{g.categoria || 'Outros'}</td>
                    <td className="py-3 pr-4 text-ink-muted">{formatDate(g.data)}</td>
                    <td className="py-3 pl-4 text-right font-semibold text-critical">{formatCurrency(g.valor)}</td>
                    <td className="py-3 pl-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(g)}
                        disabled={deletingId === g.id}
                        aria-label={`Excluir gasto ${g.descricao}`}
                        className="cursor-pointer rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-critical/10 hover:text-critical disabled:opacity-50"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(gastoParaExcluir)}
        title="Excluir gasto"
        message={
          gastoParaExcluir
            ? `Excluir o gasto "${gastoParaExcluir.descricao}" de ${formatCurrency(gastoParaExcluir.valor)}?`
            : ''
        }
        confirmLabel="Excluir"
        loading={deletingId === gastoParaExcluir?.id}
        onConfirm={handleConfirmDelete}
        onCancel={() => setGastoParaExcluir(null)}
      />
    </div>
  );
}
