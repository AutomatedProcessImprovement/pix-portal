import { useState } from "react";
import { Grid, TextField, FormHelperText } from "@mui/material";
import { Controller, FieldError, useFieldArray, UseFormReturn } from "react-hook-form";
import { JsonData } from "../formData";
import { REQUIRED_ERROR_MSG } from "../validationMessages";
import DistrFuncSelect from "./DistrFuncSelect";
import { AllowedObjectName, AllowedDistrParamsName, DISTR_FUNC, distrFuncWithLabelNames, MODE_SEC, getNumOfParamsPerDistr } from "./constants";

interface TimeDistributionProps {
    formState: UseFormReturn<JsonData, object>
    objectNamePath: AllowedObjectName
    errors?: {
        distribution_name?: FieldError
        distribution_params?: { value?: FieldError }[]
    }
    setErrorMessage: (value: string) => void
    funcLabel?: string
}


const TimeDistribution = (props: TimeDistributionProps) => {
    const { control: formControl, setValue, getValues } = props.formState
    const { objectNamePath, errors: distrErrors, setErrorMessage } = props
    const { fields, replace } = useFieldArray({
        keyName: 'key',
        control: formControl,
        name: `${objectNamePath}.distribution_params` as AllowedDistrParamsName
    });
    const [currSelectedFunc, setCurrSelectedFunc] = useState<DISTR_FUNC | null>(null)

    const updateParamsNum = (newDistrFunc: DISTR_FUNC) => {
        setCurrSelectedFunc(newDistrFunc)

        // calculate the number of parameters
        const newDefaultParamsLength = getNumOfParamsPerDistr(newDistrFunc)
        const newDefaultParams = new Array(newDefaultParamsLength).fill(0)
        replace(newDefaultParams)

        for (let index: number = 0; index < newDefaultParamsLength; index++) {
            // all values are assigned initially to 0
            setValue(`${objectNamePath}.distribution_params.${index}.value`, 0)
        }
    };

    const onNumberFieldChange = (num: Number, label: String, onChange: (value: Number) => void) => {
        let newDistrFunc = null
        if (currSelectedFunc == null) {
            newDistrFunc = getValues(`${objectNamePath}.distribution_name`) as DISTR_FUNC
            setCurrSelectedFunc(newDistrFunc)
        }

        onChange(num)
        // TODO: to return back when triang is supported
        // const distrFunc = currSelectedFunc ?? newDistrFunc
        // if (distrFunc === DISTR_FUNC.triang && label === MODE_SEC) {
        //     if (num < 0 || num > 1)
        //         setErrorMessage("Mode should be in the range [0, 1]")
        //     else
        //         onChange(num)
        // } else {
        //     onChange(num)
        // }
    };

    /**
     * This functions ignore number of parameters in provided .json file.
     * Meaning, we show number of parameters, required by the distribution function.
     * So, if some parameters are missed in .json file, they will remain empty.
     * 
     * @returns list of textfield used for filling in the parameters for distribution function
     */
    const getDistrFuncWithParams = () => {
        const paramsList = distrFuncWithLabelNames[currSelectedFunc!]
        
        return Array.from(Array(paramsList.length).keys()).map((paramIndex) => {
            const errors = distrErrors?.distribution_params?.[paramIndex]
            const labelName = paramsList[paramIndex]

            return (
                <Grid item xs={3} key={`${objectNamePath}_distribution_params_${paramIndex}`}>
                    <Controller
                        name={`${objectNamePath}.distribution_params.${paramIndex}.value` as unknown as keyof JsonData}
                        control={formControl}
                        render={({
                            field: { onChange, value }
                        }) => {
                            return <TextField
                                type="number"
                                value={value}
                                label={labelName}
                                onChange={(e) => {
                                    onNumberFieldChange(Number(e.target.value), labelName, onChange)
                                }}
                                inputProps={{
                                    step: "any",
                                    min: 0
                                }}
                                error={errors?.value !== undefined}
                                helperText={errors?.value?.message || ""}
                                variant="standard"
                            />
                        }}
                    />
                </Grid>
            )
        })
    }

    return (
        <Grid container spacing={2}>
            <Grid container item xs={4}>
                <Grid item xs={12}>
                    <Controller
                        name={`${objectNamePath}.distribution_name` as unknown as keyof JsonData}
                        control={formControl}
                        rules={{ required: REQUIRED_ERROR_MSG }}
                        render={({ field }) => {
                            return <DistrFuncSelect
                                field={field}
                                fieldError={distrErrors?.distribution_name}
                                label={props.funcLabel || "Distribution Function"}
                                updateParamsNum={updateParamsNum}
                                setCurrSelectedFunc={setCurrSelectedFunc}
                            />
                        }}
                    />
                </Grid>
            </Grid>
            <Grid container item xs={8}>
                <Grid container item spacing={2}>
                    {currSelectedFunc && getDistrFuncWithParams()}
                </Grid>
                <Grid>
                    <FormHelperText
                        error={distrErrors?.distribution_params !== undefined}
                    >{(distrErrors?.distribution_params as any)?.message || " "}</FormHelperText>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default TimeDistribution;
