import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/format';

const CATEGORY_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'];
const OTHER_COLOR = '#c3c2b7';
const MAX_BARS = 6;

function buildChartData(gastosPorCategoria) {
  const entries = Object.entries(gastosPorCategoria || {})
    .map(([categoria, total]) => ({ categoria, total: Number(total) || 0 }))
    .sort((a, b) => b.total - a.total);

  if (entries.length <= MAX_BARS) return entries;

  const top = entries.slice(0, MAX_BARS - 1);
  const outros = entries.slice(MAX_BARS - 1).reduce((sum, item) => sum + item.total, 0);
  return [...top, { categoria: 'Outros', total: outros }];
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { categoria, total } = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-ink">{categoria}</p>
      <p className="text-ink-muted">{formatCurrency(total)}</p>
    </div>
  );
}

export default function ExpensesBarChart({ gastosPorCategoria }) {
  const data = buildChartData(gastosPorCategoria);
  const isEmpty = data.length === 0;

  return (
    <Card className="p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">Gastos por categoria</h2>
          <p className="text-xs text-ink-muted">Distribuição dos seus gastos</p>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex h-64 items-center justify-center text-sm text-ink-muted">
          Nenhum gasto registrado ainda.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="#e1e0d9" />
            <XAxis
              dataKey="categoria"
              tickLine={false}
              axisLine={{ stroke: '#c3c2b7' }}
              tick={{ fill: '#898781', fontSize: 12 }}
              interval={0}
              angle={data.length > 4 ? -20 : 0}
              textAnchor={data.length > 4 ? 'end' : 'middle'}
              height={data.length > 4 ? 44 : 24}
            />
            <Tooltip cursor={{ fill: 'rgba(27,42,74,0.04)' }} content={<ChartTooltip />} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.categoria}
                  fill={entry.categoria === 'Outros' ? OTHER_COLOR : CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
