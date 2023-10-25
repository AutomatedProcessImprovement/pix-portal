import UserNav from "~/components/UserNav";

export interface HeaderProps {
  userEmail: string | null | undefined;
}

export default function Header({ userEmail }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sm:px-6">
      <div className="flex items-center">
        <img
          className="w-auto h-8 sm:h-10"
          src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
          alt="Workflow"
        />
        <h1 className="ml-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Process Improvement Explorer
        </h1>
        <div className="flex-grow"></div>
      </div>

      <UserNav userEmail={userEmail} />
    </header>
  );
}
