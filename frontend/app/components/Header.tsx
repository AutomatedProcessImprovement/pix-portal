import UserNav from "~/components/UserNav";

export interface HeaderProps {
  userEmail: string | null | undefined;
}

export default function Header({ userEmail }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sm:px-6">
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8"
        >
          <path
            fillRule="evenodd"
            d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z"
            clipRule="evenodd"
          />
        </svg>
        <h1 className="ml-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Process Improvement Explorer
        </h1>
        <div className="flex-grow"></div>
      </div>
      <UserNav userEmail={userEmail} />
    </header>
  );
}
