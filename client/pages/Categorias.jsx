import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import AddCategoryForm from '../components/AddCategoryForm';
import { deleteCategoria, getResumo, listCategorias } from '../services/financeService';
import { formatCurrency } from '../utils/format';
import { IconTag, IconTrash } from '../components/icons';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  async function loadData() {
    setError('');
    try {
      const [categoriasData, resumoData] = await Promise.all([listCategorias(), getResumo()]);
      setCategorias(categoriasData);
      setGastosPorCategoria(resumoData.gastosPorCategoria || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(categoria) {
    const confirmado = window.confirm(
      `Excluir a categoria "${categoria.nome}"? Gastos já cadastrados nela passam a aparecer como "Outros".`
    );
    if (!confirmado) return;

    setError('');
    setDeletingId(categoria.id);
    try {
      await deleteCategoria(categoria.id);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <AddCategoryForm onCreated={loadData} />

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <Alert>{error}</Alert>

          {categorias.length === 0 ? (
            <Card className="p-8 text-center text-sm text-ink-muted">
              Nenhuma categoria criada ainda.
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categorias.map((c) => (
                <Card key={c.id} className="flex items-center gap-3 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                    <IconTag className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{c.nome}</p>
                    <p className="text-xs text-ink-muted">{formatCurrency(gastosPorCategoria[c.nome] || 0)} em gastos</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    disabled={deletingId === c.id}
                    aria-label={`Excluir categoria ${c.nome}`}
                    className="shrink-0 cursor-pointer rounded-lg p-2 text-ink-muted transition-colors hover:bg-critical/10 hover:text-critical disabled:opacity-50"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
