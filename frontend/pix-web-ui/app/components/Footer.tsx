import { Link } from "@remix-run/react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="flex">
      <div className="w-full mx-auto px-6 h-14 md:flex md:items-center md:justify-between">
        <span className="text-sm text-slate-400 sm:text-center">
          © {year}{" "}
          <Link to="https://sep.cs.ut.ee/" className="text-slate-400 border-slate-400">
            Software Engineering & Information Systems Group, University of Tartu
          </Link>
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-slate-400 sm:mt-0">
          <li>
            <a href="/privacy-policy.html" className="text-slate-300 border-slate-300 me-4 md:me-6">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="/cookie-policy.html" className="text-slate-300 border-slate-300 me-4 md:me-6">
              Cookie Policy
            </a>
          </li>
          <li>
            <span className="text-slate-300 border-slate-300 me-4 md:me-6 line-through">About</span>
          </li>
        </ul>
      </div>
    </footer>
  );
}
