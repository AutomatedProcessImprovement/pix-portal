import { TextField, Grid } from "@mui/material"
import { ChangeEvent, useEffect, useState } from "react"

interface BetweenInputsProps {
    value: number[]
    onChange: any
    conditionValueError: any
    label: string
}

const BetweenInputs = (props: BetweenInputsProps) => {
    const { value, onChange, conditionValueError, label } = props
    const [minValueError, setMinValueError] = useState("")
    const [maxValueError, setMaxValueError] = useState("")
    const [isMinValueError, setIsMinValueError] = useState(false)
    const [isMaxValueError, setIsMaxValueError] = useState(false)

    useEffect(() => {
        const newError = !!conditionValueError || !!minValueError
        if (newError !== isMinValueError) {
            setIsMinValueError(newError)
        }
    }, [minValueError, conditionValueError, isMinValueError])

    useEffect(() => {
        const newError = !!conditionValueError || !!maxValueError

        if (newError !== isMaxValueError) {
            setIsMaxValueError(newError)
        }
    }, [maxValueError, conditionValueError, isMaxValueError])

    const handleInputChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        onChangeSlider: any,
        oldRange: number[],
        isFirst: boolean
    ) => {
        const newInputValue = Number(event.target.value)
        let newBetweenValue = []

        if (isFirst) {
            const secondValue = Number(oldRange[1])
            newBetweenValue = [newInputValue, secondValue]

            if (newInputValue >= secondValue) {
                setMinValueError("Value should be lower than an upper boundary")
            } else {
                setMinValueError("")
            }
        } else {
            const firstValue = Number(oldRange[0])
            newBetweenValue = [firstValue, newInputValue]

            if (newInputValue <= firstValue) {
                setMaxValueError("Value should be higher than a lower boundary")
            } else {
                setMaxValueError("")
            }
        }

        onChangeSlider(newBetweenValue)
    };

    const getHelperTextForInputValue = () => {
        const errorMessage = conditionValueError?.message
        if (errorMessage !== undefined) {
            return errorMessage
        }
    };

    const getHelperTextForSeparateValue = (index: number) => {
        if (!conditionValueError)
            // no errors, so no helperText
            return ""

        const errorMessage = conditionValueError[index]
        if (errorMessage !== undefined) {
            return errorMessage?.message
        }
    };

    const getErrorShown = (index: number) => {
        if (index === 0) {
            return (minValueError ?? getHelperTextForInputValue()) ?? getHelperTextForSeparateValue(0)
        } else if (index === 1) {
            return (maxValueError ?? getHelperTextForInputValue()) ?? getHelperTextForSeparateValue(1)
        }
    }

    return (
        <Grid item container xs={4} sx={{ ml: 1.875, mt: 2 }}>
            <Grid item xs={5.5} sx={{ mr: 2 }}>
                <TextField
                    value={value[0]}
                    type="number"
                    onChange={(e) => {
                        handleInputChange(e, onChange, value, true)
                    }}
                    variant="standard"
                    label={label}
                    inputProps={{
                        min: 0,
                        max: Number.MAX_VALUE
                    }}
                    error={isMinValueError}
                    helperText={getErrorShown(0)}
                />
            </Grid>
            <Grid item xs={5.5}>
                <TextField
                    value={value[1]}
                    type="number"
                    onChange={(e) => {
                        handleInputChange(e, onChange, value, false)
                    }}
                    variant="standard"
                    label={label}
                    inputProps={{
                        min: 0,
                        max: Number.MAX_VALUE
                    }}
                    error={isMaxValueError}
                    helperText={getErrorShown(1)}
                />
            </Grid>
        </Grid>
    )
}

export default BetweenInputs;
