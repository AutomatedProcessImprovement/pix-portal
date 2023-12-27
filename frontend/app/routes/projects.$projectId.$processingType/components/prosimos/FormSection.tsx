export default function FormSection({
  title,
  children,
  ...rest
}: {
  title: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section className={`p-4 flex flex-col space-y-2 border-4 rounded-2xl ${rest.className ? rest.className : ""}`}>
      <h3 className="text-lg font-semibold border-b-4 border-slate-200">{title}</h3>
      {children}
    </section>
  );
}
