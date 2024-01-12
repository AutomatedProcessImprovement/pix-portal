import { CheckCircleIcon } from "@heroicons/react/20/solid";
import type { Toast } from "react-hot-toast";
import toast from "react-hot-toast";

export function ToastSuccess({ t, message }: { t: Toast; message: string }) {
  return (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } w-fit bg-green-50 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-green-900 ring-opacity-5`}
    >
      <div className="flex-1 p-2 py-3 pr-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="w-6 text-green-500" aria-hidden="true" />
          </div>
          <div className="ml-2 flex-1">
            <p className="text-slate-800">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-slate-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-sm bg-green-50 hover:bg-green-50 text-slate-400 hover:text-slate-600 w-full border border-transparent rounded-none rounded-r-lg p-3 flex items-center justify-center font-medium focus:outline-none "
        >
          <span className="sr-only">Close</span>
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
