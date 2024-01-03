import React from 'react';
import ContentionAllTransitionsLayout from "./ContentionAllTransitionsLayout";
import ContentionSpecificTransitionsLayout from "./ContentionSpecificTransitionsLayout";

function Contention({jobId, selectedActivityPair}: { jobId: string; selectedActivityPair: string; }) {
    return (
        <div>
            {selectedActivityPair === 'All transitions' ? (
                <ContentionAllTransitionsLayout jobId={jobId}/>
            ) : (
                <ContentionSpecificTransitionsLayout jobId={jobId} selectedActivityPair={selectedActivityPair}/>
            )
            }
        </div>
    );
}

export default Contention;