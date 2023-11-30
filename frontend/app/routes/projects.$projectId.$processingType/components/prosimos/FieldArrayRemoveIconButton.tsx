import { TrashIcon } from "@heroicons/react/24/outline";

export function FieldArrayRemoveIconButton({ label, removeFunction }: { label?: string; removeFunction: () => void }) {
  return (
    <button
      className="bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-red-600 px-2 py-1"
      type="button"
      onClick={removeFunction}
      title="Remove item"
    >
      <TrashIcon className="w-5 h-5" />
    </button>
  );
}
