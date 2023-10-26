import UserNav from "~/components/UserNav";
import { GlobalNav } from "~/components/GlobalNav";

export interface HeaderProps {
  userEmail: string | null | undefined;
}

export default function Header({ userEmail }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <GlobalNav />
      <UserNav userEmail={userEmail} />
    </header>
  );
}
