import AllTransitionsLayout from "./AllTransitionsLayout";
import SpecificTransitionLayout from "./SpecificTransitionLayout";

function Overview({ jobId, selectedActivityPair }: { jobId: string; selectedActivityPair: string }) {
  return (
    <div>
      {selectedActivityPair === "All transitions" ? (
        <AllTransitionsLayout jobId={jobId} />
      ) : (
        <SpecificTransitionLayout jobId={jobId} selectedActivityPair={selectedActivityPair} />
      )}
    </div>
  );
}

export default Overview;
