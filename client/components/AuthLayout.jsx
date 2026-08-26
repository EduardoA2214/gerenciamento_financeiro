export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2
          rounded-full bg-brand-orange/20 blur-[120px]"
      />

      <div className="animate-page relative w-full max-w-sm">
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange text-lg font-bold shadow-lg shadow-brand-orange/30">
            $
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-2xl">{children}</div>
      </div>
    </div>
  );
}
