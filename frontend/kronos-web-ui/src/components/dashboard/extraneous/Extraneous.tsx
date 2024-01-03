import React from 'react';
import ExtraneousAllTransitionsLayout from "./ExtraneousAllTransitionsLayout";
import ExtraneousSpecificTransitionsLayout from "./ExtraneousSpecificTransitionsLayout";

function Extraneous({jobId, selectedActivityPair}: { jobId: string; selectedActivityPair: string; }) {
    return (
        <div>
            {selectedActivityPair === 'All transitions' ? (
                <ExtraneousAllTransitionsLayout jobId={jobId}/>
            ) : (
                <ExtraneousSpecificTransitionsLayout jobId={jobId} selectedActivityPair={selectedActivityPair}/>
            )
            }
        </div>
    );
}

export default Extraneous;