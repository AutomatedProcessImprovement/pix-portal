import Dashboard from "../../legacy-components/Dashboard";

export default function Results({ params }: { params: { jobId: string } }) {
  return (
    <main>
      <Dashboard jobId={params.jobId} />
    </main>
  );
}
