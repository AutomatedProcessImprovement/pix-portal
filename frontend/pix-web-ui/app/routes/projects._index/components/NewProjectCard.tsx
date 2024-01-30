import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { NewProjectDialog } from "./NewProjectDialog";

export default function NewProjectCard() {
  return (
    <NewProjectDialog>
      <div className="group cursor-pointer flex flex-col bg-white border-2 border-dashed hover:border-solid border-slate-200 rounded-lg md:flex-row md:max-w-36 ">
        <div className="flex flex-grow flex-col items-center p-4 space-y-2 leading-normal text-slate-400">
          <p className="flex items-center text-xl text-center font-semibold tracking-normal group-hover:text-slate-900 transition ease-in-out duration-300">
            Create a&nbsp;project
          </p>
          <PlusCircleIcon className="w-12 h-12 group-hover:text-blue-500 transition ease-in-out duration-500" />
        </div>
      </div>
    </NewProjectDialog>
  );
}
