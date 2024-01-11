import { GlobalNav } from "~/components/GlobalNav";
import UserNav from "~/components/UserNav";

export interface HeaderProps {
  userEmail: string | null | undefined;
}

export default function Header({ userEmail }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-2 bg-white border-b border-gray-200 min-h-14">
      <GlobalNav />
      <UserNav userEmail={userEmail} />
    </header>
  );
}
