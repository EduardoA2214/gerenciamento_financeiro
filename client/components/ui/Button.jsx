const variants = {
  primary: 'bg-brand-orange text-white hover:bg-brand-orange-dark focus-visible:outline-brand-orange',
  secondary: 'bg-navy-900 text-white hover:bg-navy-800 focus-visible:outline-navy-900',
  ghost: 'bg-transparent text-ink hover:bg-page focus-visible:outline-navy-900',
  danger: 'bg-critical text-white hover:bg-critical/90 focus-visible:outline-critical'
};

export default function Button({ variant = 'primary', className = '', children, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold
        transition-all duration-150 outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.97] cursor-pointer ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
