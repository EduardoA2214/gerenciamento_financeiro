import Card from './ui/Card';
import { formatCurrency, formatDate } from '../utils/format';
import { IconTrendUp, IconTrendDown } from './icons';

const MAX_ITEMS = 8;

function mergeTransactions(gastos, salarios) {
  const receitas = salarios.map((s) => ({
    id: `salario-${s.id}`,
    tipo: 'entrada',
    descricao: s.descricao || 'Salário',
    categoria: null,
    valor: Number(s.valor),
    data: s.data
  }));

  const despesas = gastos.map((g) => ({
    id: `gasto-${g.id}`,
    tipo: 'saida',
    descricao: g.descricao,
    categoria: g.categoria,
    valor: Number(g.valor),
    data: g.data
  }));

  return [...receitas, ...despesas]
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .slice(0, MAX_ITEMS);
}

export default function RecentTransactions({ gastos, salarios }) {
  const items = mergeTransactions(gastos, salarios);

  return (
    <Card className="p-5 lg:p-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-ink">Últimos lançamentos</h2>
        <p className="text-xs text-ink-muted">Salários e gastos mais recentes</p>
      </div>

      {items.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-ink-muted">
          Nenhum lançamento registrado ainda.
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  item.tipo === 'entrada' ? 'bg-good/10 text-good' : 'bg-critical/10 text-critical'
                }`}
              >
                {item.tipo === 'entrada' ? (
                  <IconTrendUp className="h-4 w-4" />
                ) : (
                  <IconTrendDown className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{item.descricao}</p>
                <p className="text-xs text-ink-muted">
                  {item.categoria ? `${item.categoria} · ` : ''}
                  {formatDate(item.data)}
                </p>
              </div>

              <span className={`shrink-0 text-sm font-semibold ${item.tipo === 'entrada' ? 'text-good' : 'text-critical'}`}>
                {item.tipo === 'entrada' ? '+' : '-'} {formatCurrency(item.valor)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
