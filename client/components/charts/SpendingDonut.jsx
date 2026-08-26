import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/format';

const TRACK_COLOR = '#e6e9f2';
const ORANGE = '#f5a623';
const CRITICAL = '#d03b3b';

export default function SpendingDonut({ totalSalario, totalGastos, saldo }) {
  const overspent = totalSalario > 0 ? totalGastos > totalSalario : totalGastos > 0;
  const rawPct = totalSalario > 0 ? (totalGastos / totalSalario) * 100 : totalGastos > 0 ? 100 : 0;
  const pct = Math.min(100, Math.round(rawPct));
  const arcColor = overspent ? CRITICAL : ORANGE;

  const data = [
    { name: 'gasto', value: pct },
    { name: 'restante', value: 100 - pct }
  ];

  return (
    <Card className="flex flex-col gap-5 p-5 lg:p-6">
      <div>
        <h2 className="text-sm font-semibold text-ink">% da renda gasta</h2>
        <p className="text-xs text-ink-muted">Comparado ao total de renda cadastrada</p>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative h-36 w-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={48}
                outerRadius={64}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                <Cell fill={arcColor} />
                <Cell fill={TRACK_COLOR} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-ink">{pct}%</span>
            {overspent && <span className="text-[10px] font-semibold text-critical">acima da renda</span>}
          </div>
        </div>

        <dl className="flex-1 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-muted">Renda</dt>
            <dd className="font-semibold text-ink">{formatCurrency(totalSalario)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-muted">Gastos</dt>
            <dd className="font-semibold text-ink">{formatCurrency(totalGastos)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
            <dt className="text-ink-muted">Saldo</dt>
            <dd className={`font-semibold ${saldo < 0 ? 'text-critical' : 'text-good'}`}>{formatCurrency(saldo)}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
