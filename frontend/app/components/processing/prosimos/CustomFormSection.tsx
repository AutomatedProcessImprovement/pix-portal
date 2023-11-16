export default function CustomFormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-4 flex flex-col space-y-2 border-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </section>
  );
}
