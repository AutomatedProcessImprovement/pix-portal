import { PlusCircleIcon } from "@heroicons/react/20/solid";

export default function UploadAssetButton({ ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`group flex flex-auto space-x-1 items-center justify-center cursor-pointer ${
        rest.className ? rest.className : ""
      }`}
    >
      <PlusCircleIcon className="h-5 w-auto text-blue-500 group-hover:text-blue-600" />
      <span className="text-blue-500 group-hover:text-blue-600 border-b border-blue-500">Upload asset</span>
    </div>
  );
}
