import { Link } from "@remix-run/react";

export function GlobalNav() {
  return (
    <nav className="flex items-center space-x-2">
      <Link to="/" title="Go to Home" className="border-none">
        <h1 className="text-2xl font-bold leading-7 text-black sm:truncate">Process Improvement Explorer</h1>
      </Link>
      <div className="flex-grow"></div>
    </nav>
  );
}
