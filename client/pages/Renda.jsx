import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
  createSalario,
  deleteSalario,
  listSalarios,
  createRendaFixa,
  deleteRendaFixa,
  listRendasFixas,
  lancarRendaFixa
} from '../services/financeService';
import { formatCurrency, formatDate } from '../utils/format';
import { formatProximaOcorrencia, diasAteProximaOcorrencia } from '../utils/date';
import { IconPlus, IconTrash, IconRepeat, IconBanknote } from '../components/icons';

export default function Renda() {
  const [rendas, setRendas] = useState([]);
  const [rendasFixas, setRendasFixas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formAberto, setFormAberto] = useState(null);

  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [rendaParaExcluir, setRendaParaExcluir] = useState(null);

  const [fixaDescricao, setFixaDescricao] = useState('');
  const [fixaValor, setFixaValor] = useState('');
  const [fixaDia, setFixaDia] = useState('');
  const [fixaSubmitting, setFixaSubmitting] = useState(false);
  const [fixaError, setFixaError] = useState('');
  const [fixaDeletingId, setFixaDeletingId] = useState(null);
  const [lancandoId, setLancandoId] = useState(null);
  const [fixaParaLancar, setFixaParaLancar] = useState(null);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [rendasData, rendasFixasData] = await Promise.all([listSalarios(), listRendasFixas()]);
      setRendas(rendasData);
      setRendasFixas(rendasFixasData);
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

  function toggleForm(tipo) {
    setFormError('');
    setFixaError('');
    setFormAberto((atual) => (atual === tipo ? null : tipo));
  }

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
      setFormAberto(null);
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(renda) {
    setRendaParaExcluir(renda);
  }

  async function handleConfirmDelete() {
    const renda = rendaParaExcluir;
    if (!renda) return;

    setError('');
    setDeletingId(renda.id);
    try {
      await deleteSalario(renda.id);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
      setRendaParaExcluir(null);
    }
  }

  async function handleFixaSubmit(event) {
    event.preventDefault();
    setFixaError('');

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

    if (!fixaDescricao.trim()) {
      setFixaError('Informe uma descrição.');
      return;
    }

    setFixaSubmitting(true);
    try {
      await createRendaFixa(fixaDescricao.trim(), valorNumerico, dia);
      setFixaDescricao('');
      setFixaValor('');
      setFixaDia('');
      setFormAberto(null);
      await loadData();
    } catch (err) {
      setFixaError(err.message);
    } finally {
      setFixaSubmitting(false);
    }
  }

  async function handleDeleteFixa(rendaFixa) {
    setFixaError('');
    setFixaDeletingId(rendaFixa.id);
    try {
      await deleteRendaFixa(rendaFixa.id);
      await loadData();
    } catch (err) {
      setFixaError(err.message);
    } finally {
      setFixaDeletingId(null);
    }
  }

  function handleLancarAgora(rendaFixa) {
    setFixaParaLancar(rendaFixa);
  }

  async function handleConfirmLancar() {
    const rendaFixa = fixaParaLancar;
    if (!rendaFixa) return;

    setFixaError('');
    setLancandoId(rendaFixa.id);
    try {
      await lancarRendaFixa(rendaFixa.id);
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
          Renda fixa
        </Button>
        <Button variant={formAberto === 'unica' ? 'secondary' : 'primary'} onClick={() => toggleForm('unica')}>
          <IconBanknote className="h-4 w-4" />
          Registrar renda instantânea 
        </Button>
      </div>

      {formAberto === 'fixa' && (
        <Card className="p-5 lg:p-6">
          <h2 className="mb-1 text-sm font-semibold text-ink">Nova renda fixa</h2>
          <p className="mb-4 text-xs text-ink-muted">
            Cadastre uma renda que se repete todo mês (ex: salário todo dia 30) pra saber quando esperar cada uma.
          </p>

          <form onSubmit={handleFixaSubmit} className="flex flex-col gap-4">
            <Alert>{fixaError}</Alert>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <Input
                  id="fixaDescricao"
                  label="Descrição"
                  placeholder="Ex: Salário CLT"
                  value={fixaDescricao}
                  onChange={(e) => setFixaDescricao(e.target.value)}
                  required
                />
              </div>
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
                placeholder="Ex: 30"
                value={fixaDia}
                onChange={(e) => setFixaDia(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={fixaSubmitting} className="self-start">
                <IconPlus className="h-4 w-4" />
                {fixaSubmitting ? 'Salvando...' : 'Adicionar renda fixa'}
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
          <h2 className="mb-4 text-sm font-semibold text-ink">Registrar renda recebida</h2>
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
                placeholder="Renda"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} className="self-start">
                <IconPlus className="h-4 w-4" />
                {submitting ? 'Salvando...' : 'Adicionar renda'}
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
          <h2 className="text-sm font-semibold text-ink">Rendas fixas</h2>
        </div>

        {formAberto !== 'fixa' && <Alert>{fixaError}</Alert>}

        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <Spinner />
          </div>
        ) : rendasFixas.length === 0 ? (
          <p className="py-4 text-center text-sm text-ink-muted">Nenhuma renda fixa cadastrada ainda.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rendasFixas.map((rf) => {
              const dias = diasAteProximaOcorrencia(rf.diaMes);
              return (
                <li key={rf.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{rf.descricao}</p>
                    <p className="text-xs text-ink-muted">
                      {formatCurrency(rf.valor)} · todo dia {rf.diaMes} · próxima entrada:{' '}
                      <span className="font-medium text-brand-orange">
                        {formatProximaOcorrencia(rf.diaMes)} {dias === 0 ? '(hoje)' : `(em ${dias} dia${dias === 1 ? '' : 's'})`}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleLancarAgora(rf)}
                      disabled={lancandoId === rf.id}
                      className="!px-3 !py-1.5 text-xs"
                    >
                      {lancandoId === rf.id ? 'Lançando...' : 'Lançar agora'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFixa(rf)}
                      disabled={fixaDeletingId === rf.id}
                      aria-label={`Excluir renda fixa ${rf.descricao}`}
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
        <h2 className="mb-4 text-sm font-semibold text-ink">Histórico de renda recebida</h2>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <Alert>{error}</Alert>
        ) : rendas.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">Nenhuma renda registrada ainda.</p>
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="py-2 pr-4 font-medium">Descrição</th>
                  <th className="py-2 pr-4 font-medium">Data</th>
                  <th className="py-2 pl-4 text-right font-medium">Valor</th>
                  <th className="py-2 pl-4 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rendas.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 pr-4 font-medium text-ink">{r.descricao || 'Renda'}</td>
                    <td className="py-3 pr-4 text-ink-muted">{formatDate(r.data)}</td>
                    <td className="py-3 pl-4 text-right font-semibold text-good">{formatCurrency(r.valor)}</td>
                    <td className="py-3 pl-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        disabled={deletingId === r.id}
                        aria-label={`Excluir renda ${r.descricao || 'Renda'}`}
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
        open={Boolean(rendaParaExcluir)}
        title="Excluir renda"
        message={
          rendaParaExcluir
            ? `Excluir a renda "${rendaParaExcluir.descricao || 'Renda'}" de ${formatCurrency(rendaParaExcluir.valor)}?`
            : ''
        }
        confirmLabel="Excluir"
        loading={deletingId === rendaParaExcluir?.id}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRendaParaExcluir(null)}
      />

      <ConfirmDialog
        open={Boolean(fixaParaLancar)}
        title="Lançar renda"
        message={
          fixaParaLancar
            ? `Lançar "${fixaParaLancar.descricao}" de ${formatCurrency(fixaParaLancar.valor)}? O histórico de gastos deste mês será zerado (a % gasta recomeça do zero) e o saldo atual será somado a essa renda.`
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
