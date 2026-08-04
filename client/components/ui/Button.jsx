const variants = {
  primary: 'bg-brand-orange text-white hover:bg-brand-orange-dark focus-visible:outline-brand-orange',
  secondary: 'bg-navy-900 text-white hover:bg-navy-800 focus-visible:outline-navy-900',
  ghost: 'bg-transparent text-ink hover:bg-page focus-visible:outline-navy-900'
};

export default function Button({ variant = 'primary', className = '', children, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
        transition-colors duration-150 outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
