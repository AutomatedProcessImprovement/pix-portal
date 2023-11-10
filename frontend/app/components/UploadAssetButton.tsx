import { PlusCircleIcon } from "@heroicons/react/20/solid";

export default function UploadAssetButton() {
  return (
    <div className="group flex flex-auto space-x-1 items-center justify-between cursor-pointer">
      <PlusCircleIcon className="h-5 w-auto text-blue-500 group-hover:text-blue-600" />
      <a>Upload asset</a>
    </div>
  );
}
