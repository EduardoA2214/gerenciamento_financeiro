export default function Spinner({ className = '' }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-navy-800/20 border-t-navy-800 ${className}`}
      role="status"
      aria-label="Carregando"
    />
  );
}
