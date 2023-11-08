import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Fragment, useEffect, useState } from "react";
import { AssetTypeBackend, assetTypeToString } from "~/shared/AssetTypeBackend";

export default function UploadAssetSelect({
  selected,
  onChange,
  assetTypes,
}: {
  selected: AssetTypeBackend;
  onChange: (value: AssetTypeBackend) => void;
  assetTypes: AssetTypeBackend[];
}) {
  const [selectedAssetType, setSelectedAssetType] = useState<AssetTypeBackend>(selected);

  useEffect(() => {
    setSelectedAssetType(selectedAssetType);
    onChange(selectedAssetType);
  }, [selectedAssetType]);

  return (
    <div className="w-64 z-50">
      <Listbox value={selected} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white hover:bg-white py-2 pl-3 pr-10 text-left text-gray-900 border-4 border-blue-100 hover:border-blue-500 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300">
            <span className="block truncate">{assetTypeToString(selected)}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
              {assetTypes.map((asset, personIdx) => (
                <Listbox.Option
                  key={personIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                    }`
                  }
                  value={asset}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}>
                        {assetTypeToString(asset)}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
