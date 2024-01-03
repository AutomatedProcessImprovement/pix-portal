import React from 'react';
import UnavailabilityAllTransitionsLayout from "./UnavailabilityAllTransitionsLayout";
import UnavailabilitySpecificTransitionsLayout from "./UnavailabilitySpecificTransitionsLayout";

function Unavailability({jobId, selectedActivityPair}: { jobId: string; selectedActivityPair: string; }) {
    return (
        <div>
            {selectedActivityPair === 'All transitions' ? (
                <UnavailabilityAllTransitionsLayout jobId={jobId}/>
            ) : (
                <UnavailabilitySpecificTransitionsLayout jobId={jobId} selectedActivityPair={selectedActivityPair}/>
            )
            }
        </div>
    );
}

export default Unavailability;