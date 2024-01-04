export function ProcessingAppSection({ heading, children }: { heading?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col items-center p-4">
      {heading && <h2 className="text-xl text-slate-500 font-semibold">{heading}</h2>}
      {children}
    </section>
  );
}
