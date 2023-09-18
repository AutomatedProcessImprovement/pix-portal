import { TextField, Typography } from "@mui/material"
import { Grid } from "@mui/material"
import { useState, useEffect } from "react";
import { Controller, Path, UseFormReturn } from "react-hook-form";
import { JsonData } from "../formData";
import { REQUIRED_ERROR_MSG } from "../validationMessages";

interface BatchingProbabilityProps {
    formState: UseFormReturn<JsonData, object>
    taskIndex: number
}

function findByKey(this: any, { key }: { key: any }) {
    return key === this.targetKey
}


const getFixedProbNum = (batchProbNewValue: any, precision: number) => {
    // return probably of not batching and batching with fixed precision
    // the first in the array is the value corresponding to the input probability
    // we just apply precision to that number
    const batchProbNewNum = Number(parseFloat(batchProbNewValue).toFixed(precision))
    const oppositeBatchProb = Number((Math.abs(1 - batchProbNewNum)).toFixed(precision))
    return [batchProbNewNum, oppositeBatchProb]
}

const BatchingProbability = (props: BatchingProbabilityProps) => {
    const { formState: { control: formControl, formState: { errors: { batch_processing: batchProcessingErrors } } }, taskIndex } = props
    const [errorToShow, seterrorToShow] = useState("")

    useEffect(() => {
        const currentBatchProcessError = batchProcessingErrors?.[taskIndex]?.size_distrib
        const currentBatchProcessErrorMessage = (currentBatchProcessError as any)?.message

        if (currentBatchProcessErrorMessage?.length > 0) {
            // there are errors
            if (currentBatchProcessErrorMessage !== errorToShow) {
                seterrorToShow(currentBatchProcessErrorMessage)
            }
        }
    }, [batchProcessingErrors])

    const getBatchingProb = (sizeDistrObj: any) => {
        // we show the probability of the batch
        // we either look for element with 1 or 2 as a key
        const allKeys = sizeDistrObj.map(({ key }: { key: any }) => key)

        if ("1" in allKeys) {
            const noBatchProbStr = sizeDistrObj.find(findByKey, { targetKey: "1" }).value
            const [_, batchProb] = getFixedProbNum(noBatchProbStr, 5)

            return batchProb
        }
        else if ("2" in allKeys) {
            const batchProbStr = sizeDistrObj.find(findByKey, { targetKey: "2" }).value
            const batchProbNewNum = Number(parseFloat(batchProbStr).toFixed(5))

            return batchProbNewNum
        }
    }

    const updateProb = (newEvent: any, onChange: any) => {
        const batchProbNewValue = newEvent.target.value

        // we use precision here to avoid having values like 0.100000000000002 after 
        const [batchProbNewNum, noBatchProb] = getFixedProbNum(batchProbNewValue, 5)

        const newSizeDistrObj = [
            { "key": "1", "value": noBatchProb },
            { "key": "2", "value": batchProbNewNum }
        ]
        onChange(newSizeDistrObj)
    }

    return (
        <Grid item container xs={6} spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6" align="left"> Batching Probability </Typography>
            </Grid>
            <Grid item xs={12} style={{ minHeight: "20vh", paddingTop: "8px" }}>
                <Controller
                    name={`batch_processing.${taskIndex}.size_distrib` as Path<JsonData>}
                    control={formControl}
                    rules={{ required: REQUIRED_ERROR_MSG }}
                    render={({ field: { ref, onChange, value, ...others } }) => {
                        return (
                            <TextField
                                {...others}
                                value={getBatchingProb(value)}
                                onChange={e => updateProb(e, onChange)}
                                inputRef={ref}
                                style={{ width: "100%" }}
                                error={errorToShow !== ""}
                                helperText={errorToShow}
                                variant="standard"
                                type="number"
                                inputProps={{
                                    step: "0.1",
                                    min: 0,
                                    max: 1
                                }}
                                label="Probability (from 0 to 1)"
                            />
                        )
                    }}
                />
            </Grid>
        </Grid>
    )
}

export default BatchingProbability;
