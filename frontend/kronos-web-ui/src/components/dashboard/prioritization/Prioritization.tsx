import React from 'react';
import PrioritizationAllTransitionsLayout from "./PrioritizationAllTransitionsLayout";
import PrioritizationSpecificTransitionsLayout from "./PrioritizationSpecificTransitionsLayout";

function Prioritization({jobId, selectedActivityPair}: { jobId: string; selectedActivityPair: string; }) {
    return (
        <div>
            {selectedActivityPair === 'All transitions' ? (
                <PrioritizationAllTransitionsLayout jobId={jobId}/>
            ) : (
                <PrioritizationSpecificTransitionsLayout jobId={jobId} selectedActivityPair={selectedActivityPair}/>
            )
            }
        </div>
    );
}

export default Prioritization;