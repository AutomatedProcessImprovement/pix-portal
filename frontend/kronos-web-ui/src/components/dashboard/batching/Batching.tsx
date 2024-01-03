import React from 'react';
import BatchingAllTransitionsLayout from './BatchingAllTransitionsLayout';
import BatchingSpecificTransitionLayout from './BatchingSpecificTransitionLayout';

function Batching({jobId, selectedActivityPair}: { jobId: string; selectedActivityPair: string; }) {
    return (
        <div>
            {selectedActivityPair === 'All transitions' ? (
                <BatchingAllTransitionsLayout jobId={jobId}/>
            ) : (
                <BatchingSpecificTransitionLayout jobId={jobId} selectedActivityPair={selectedActivityPair}/>
            )
            }
        </div>
    );
}

export default Batching;