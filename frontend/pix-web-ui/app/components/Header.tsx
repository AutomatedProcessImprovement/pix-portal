import { GlobalNav } from "~/components/GlobalNav";
import UserNav from "~/components/UserNav";

export interface HeaderProps {
  userEmail: string | null | undefined;
}

export default function Header({ userEmail }: HeaderProps) {
  return (
    <header className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 px-6 py-2 bg-white border-b border-slate-200">
      <GlobalNav />
      <UserNav userEmail={userEmail} />
    </header>
  );
}
