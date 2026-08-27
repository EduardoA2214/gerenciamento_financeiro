export default function Input({ label, id, className = '', ...props }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      {label && <span className="font-medium text-ink">{label}</span>}
      <input
        id={id}
        className={`rounded-2xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none
          transition-colors placeholder:text-ink-muted focus:border-navy-800 focus:ring-2 focus:ring-navy-800/10
          ${className}`}
        {...props}
      />
    </label>
  );
}
