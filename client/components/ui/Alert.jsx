const variants = {
  error: 'bg-critical/10 text-critical border-critical/20',
  success: 'bg-good/10 text-good border-good/20'
};

export default function Alert({ variant = 'error', children }) {
  if (!children) return null;

  return (
    <div className={`rounded-xl border px-3.5 py-2.5 text-sm font-medium ${variants[variant]}`} role="alert">
      {children}
    </div>
  );
}
