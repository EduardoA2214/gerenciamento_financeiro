export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange text-lg font-bold">
            $
          </div>
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">{children}</div>
      </div>
    </div>
  );
}
