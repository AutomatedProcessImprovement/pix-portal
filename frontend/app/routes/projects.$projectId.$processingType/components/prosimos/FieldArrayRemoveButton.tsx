export function FieldArrayRemoveButton({ label, onClick }: { label?: string; onClick: () => void }) {
  return (
    <button className="bg-slate-200 hover:bg-slate-300 text-slate-700" type="button" onClick={onClick}>
      {label || "Remove"}
    </button>
  );
}
