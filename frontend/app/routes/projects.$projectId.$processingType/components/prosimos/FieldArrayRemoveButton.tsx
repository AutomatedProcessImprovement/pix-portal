export function FieldArrayRemoveButton({ label, removeFunction }: { label?: string; removeFunction: () => void }) {
  return (
    <button className="bg-slate-400" type="button" onClick={removeFunction}>
      {label || "Remove"}
    </button>
  );
}
