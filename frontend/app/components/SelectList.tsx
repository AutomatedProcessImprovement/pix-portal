import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Fragment, useEffect, useState } from "react";
import type { ILabeled } from "./shared";

export default function SelectList<T extends ILabeled>({
  selected,
  onChange,
  options,
  className,
  optionClassName,
}: {
  selected: T | undefined;
  onChange: (value: T | undefined) => void;
  options: T[];
  className?: string;
  optionClassName?: string;
}) {
  const [selectedOption, setSelectedOption] = useState<T | undefined>(selected);

  useEffect(() => {
    setSelectedOption(selectedOption);
    onChange(selectedOption);
  }, [selectedOption, onChange]);

  return (
    <div className={`z-50 ${className}`}>
      <Listbox value={selected} onChange={onChange} defaultValue={options.length > 0 ? options[0] : {}}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white hover:bg-white py-1 pl-3 pr-10 text-left text-gray-900 border-4 border-blue-100 hover:border-blue-500 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300">
            <span className="block truncate">{selected?.label ?? "No Label"}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
              {options.map((option, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-8 pr-4 ${
                      active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                    } ${optionClassName ? optionClassName : ""}`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}>
                        {option.label}
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
