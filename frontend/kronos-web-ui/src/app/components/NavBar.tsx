import Image from "next/image";

export default function NavBar() {
  return (
    <nav className="bg-blue-500 h-16 flex p-4 shadow-md shadow-blue-200 mb-4">
      <span className="flex space-x-4 text-white items-center">
        <Image src="/kronos-logo.png" alt="Kronos Logotype" height={40} width={50} />
        <span className="text-xl font-semibold tracking-wide">Kronos</span>
      </span>
    </nav>
  );
}
