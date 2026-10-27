import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
  createGasto,
  deleteGasto,
  listCategorias,
  listGastos,
  createGastoFixo,
  deleteGastoFixo,
  listGastosFixos,
  lancarGastoFixo
} from '../services/financeService';
import { formatCurrency, formatDate } from '../utils/format';
import { formatProximaOcorrencia, diasAteProximaOcorrencia } from '../utils/date';
import { IconPlus, IconTrash, IconRepeat, IconWallet } from '../components/icons';

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [gastosFixos, setGastosFixos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formAberto, setFormAberto] = useState(null);
  const [fixaDescricao, setFixaDescricao] = useState('');
  const [fixaValor, setFixaValor] = useState('');
  const [fixaDia, setFixaDia] = useState('');
  const [fixaCategoria, setFixaCategoria] = useState('');
  const [fixaSubmitting, setFixaSubmitting] = useState(false);
  const [fixaError, setFixaError] = useState('');
  const [fixaDeletingId, setFixaDeletingId] = useState(null);
  const [fixaParaExcluir, setFixaParaExcluir] = useState(null);
  const [lancandoId, setLancandoId] = useState(null);
  const [fixaParaLancar, setFixaParaLancar] = useState(null);

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
      const [gastosData, gastosFixosData, categoriasData] = await Promise.all([
        listGastos(),
        listGastosFixos(),
        listCategorias()
      ]);
      setGastos(gastosData);
      setGastosFixos(gastosFixosData);
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
      setFormAberto(null);
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

  function toggleForm(tipo) {
    setFormError('');
    setFixaError('');
    setFormAberto((atual) => (atual === tipo ? null : tipo));
  }

  async function handleFixaSubmit(event) {
    event.preventDefault();
    setFixaError('');

    if (!fixaDescricao.trim()) {
      setFixaError('Informe uma descrição.');
      return;
    }

    const valorNumerico = Number(fixaValor);
    if (!valorNumerico || valorNumerico <= 0) {
      setFixaError('Informe um valor maior que zero.');
      return;
    }

    const dia = Number(fixaDia);
    if (!Number.isInteger(dia) || dia < 1 || dia > 31) {
      setFixaError('Informe um dia do mês entre 1 e 31.');
      return;
    }

    setFixaSubmitting(true);
    try {
      await createGastoFixo(fixaDescricao.trim(), valorNumerico, dia, fixaCategoria || undefined);
      setFixaDescricao('');
      setFixaValor('');
      setFixaDia('');
      setFixaCategoria('');
      setFormAberto(null);
      await loadData();
    } catch (err) {
      setFixaError(err.message);
    } finally {
      setFixaSubmitting(false);
    }
  }

  async function handleConfirmDeleteFixa() {
    const gastoFixo = fixaParaExcluir;
    if (!gastoFixo) return;

    setFixaError('');
    setFixaDeletingId(gastoFixo.id);
    try {
      await deleteGastoFixo(gastoFixo.id);
      await loadData();
    } catch (err) {
      setFixaError(err.message);
    } finally {
      setFixaDeletingId(null);
      setFixaParaExcluir(null);
    }
  }

  async function handleConfirmLancar() {
    const gastoFixo = fixaParaLancar;
    if (!gastoFixo) return;

    setFixaError('');
    setLancandoId(gastoFixo.id);
    try {
      await lancarGastoFixo(gastoFixo.id);
      await loadData();
    } catch (err) {
      setFixaError(err.message);
    } finally {
      setLancandoId(null);
      setFixaParaLancar(null);
    }
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant={formAberto === 'fixa' ? 'secondary' : 'primary'} onClick={() => toggleForm('fixa')}>
          <IconRepeat className="h-4 w-4" />
          Gasto fixo
        </Button>
        <Button variant={formAberto === 'unica' ? 'secondary' : 'primary'} onClick={() => toggleForm('unica')}>
          <IconWallet className="h-4 w-4" />
          Registrar gasto instantâneo
        </Button>
      </div>

      <datalist id="categorias-list">
        {categorias.map((c) => (
          <option key={c.id} value={c.nome} />
        ))}
      </datalist>

      {formAberto === 'fixa' && (
        <Card className="p-5 lg:p-6">
          <h2 className="mb-1 text-sm font-semibold text-ink">Novo gasto fixo</h2>
          <p className="mb-4 text-xs text-ink-muted">
            Cadastre um gasto que se repete todo mês (ex: Netflix todo dia 10) pra saber quando cada um vai vencer.
          </p>

          <form onSubmit={handleFixaSubmit} className="flex flex-col gap-4">
            <Alert>{fixaError}</Alert>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <Input
                id="fixaDescricao"
                label="Descrição"
                placeholder="Ex: Netflix"
                value={fixaDescricao}
                onChange={(e) => setFixaDescricao(e.target.value)}
                required
              />
              <Input
                id="fixaValor"
                label="Valor (R$)"
                type="number"
                min="0.01"
                step="0.01"
                value={fixaValor}
                onChange={(e) => setFixaValor(e.target.value)}
                required
              />
              <Input
                id="fixaDia"
                label="Dia do mês"
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 10"
                value={fixaDia}
                onChange={(e) => setFixaDia(e.target.value)}
                required
              />
              <Input
                id="fixaCategoria"
                label="Categoria"
                list="categorias-list"
                placeholder="Outros"
                value={fixaCategoria}
                onChange={(e) => setFixaCategoria(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={fixaSubmitting} className="self-start">
                <IconPlus className="h-4 w-4" />
                {fixaSubmitting ? 'Salvando...' : 'Adicionar gasto fixo'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setFormAberto(null)} className="self-start">
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {formAberto === 'unica' && (
        <Card className="p-5 lg:p-6">
          <h2 className="mb-4 text-sm font-semibold text-ink">Registrar gasto</h2>
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
              <Input
                id="categoria"
                label="Categoria"
                list="categorias-list"
                placeholder="Outros"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} className="self-start">
                <IconPlus className="h-4 w-4" />
                {submitting ? 'Salvando...' : 'Adicionar gasto'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setFormAberto(null)} className="self-start">
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-5 lg:p-6">
        <div className="mb-4 flex items-center gap-2">
          <IconRepeat className="h-4.5 w-4.5 text-brand-orange" />
          <h2 className="text-sm font-semibold text-ink">Gastos fixos</h2>
        </div>

        {formAberto !== 'fixa' && <Alert>{fixaError}</Alert>}

        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <Spinner />
          </div>
        ) : gastosFixos.length === 0 ? (
          <p className="py-4 text-center text-sm text-ink-muted">Nenhum gasto fixo cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-line">
            {gastosFixos.map((gf) => {
              const dias = diasAteProximaOcorrencia(gf.diaMes);
              return (
                <li key={gf.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{gf.descricao}</p>
                    <p className="text-xs text-ink-muted">
                      {formatCurrency(gf.valor)} · {gf.categoria || 'Outros'} · todo dia {gf.diaMes} · próximo vencimento:{' '}
                      <span className="font-medium text-critical">
                        {formatProximaOcorrencia(gf.diaMes)} {dias === 0 ? '(hoje)' : `(em ${dias} dia${dias === 1 ? '' : 's'})`}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setFixaParaLancar(gf)}
                      disabled={lancandoId === gf.id}
                      className="!px-3 !py-1.5 text-xs"
                    >
                      {lancandoId === gf.id ? 'Lançando...' : 'Lançar agora'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setFixaParaExcluir(gf)}
                      disabled={fixaDeletingId === gf.id}
                      aria-label={`Excluir gasto fixo ${gf.descricao}`}
                      className="cursor-pointer rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-critical/10 hover:text-critical disabled:opacity-50"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
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

      <ConfirmDialog
        open={Boolean(fixaParaExcluir)}
        title="Excluir gasto fixo"
        message={
          fixaParaExcluir
            ? `Excluir o gasto fixo "${fixaParaExcluir.descricao}" de ${formatCurrency(fixaParaExcluir.valor)}? Os gastos já lançados no histórico não serão apagados.`
            : ''
        }
        confirmLabel="Excluir"
        loading={fixaDeletingId === fixaParaExcluir?.id}
        onConfirm={handleConfirmDeleteFixa}
        onCancel={() => setFixaParaExcluir(null)}
      />

      <ConfirmDialog
        open={Boolean(fixaParaLancar)}
        title="Lançar gasto"
        message={
          fixaParaLancar
            ? `Lançar "${fixaParaLancar.descricao}" de ${formatCurrency(fixaParaLancar.valor)} no histórico de gastos deste mês?`
            : ''
        }
        confirmLabel="Lançar"
        danger={false}
        loading={lancandoId === fixaParaLancar?.id}
        onConfirm={handleConfirmLancar}
        onCancel={() => setFixaParaLancar(null)}
      />
    </div>
  );
}
