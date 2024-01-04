import Link from "next/link";

export default function Home() {
  return (
    <main className="px-6 py-2">
      <Link href={`/results`}>Go to Results</Link>
    </main>
  );
}
