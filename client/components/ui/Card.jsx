export default function Card({ className = '', hover = false, children, ...props }) {
  return (
    <div
      className={`rounded-3xl bg-white border border-line shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.12)]
        ${hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_16px_32px_-16px_rgba(16,24,40,0.18)]' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
