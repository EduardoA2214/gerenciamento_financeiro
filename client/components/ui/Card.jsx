export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-2xl bg-white border border-line shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
