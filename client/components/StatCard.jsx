import Card from './ui/Card';

export default function StatCard({ label, value, icon: Icon, highlight = false }) {
  return (
    <Card
      className={`flex items-center justify-between gap-3 p-5 ${
        highlight ? '!bg-navy-900 !border-navy-900 text-white' : ''
      }`}
    >
      <div>
        <p className={`text-xs font-medium uppercase tracking-wide ${highlight ? 'text-white/60' : 'text-ink-muted'}`}>
          {label}
        </p>
        <p className={`mt-2 text-2xl font-bold ${highlight ? 'text-white' : 'text-ink'}`}>{value}</p>
      </div>
      {Icon && (
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            highlight ? 'bg-white/10 text-brand-orange' : 'bg-brand-orange/10 text-brand-orange'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
    </Card>
  );
}
