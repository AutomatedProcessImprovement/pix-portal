import React, { useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import { ControllerRenderProps, FieldError } from "react-hook-form";
import { useEffect } from "react";
import { DISTR_FUNC } from "./constants";

interface DistrFuncSelectProps<FieldValues> {
    field: ControllerRenderProps<FieldValues, any>,
    label?: string
    fieldError?: FieldError
    updateParamsNum: (newDistrFunc: DISTR_FUNC) => void
    setCurrSelectedFunc: (newDistrFunc: DISTR_FUNC) => void
}

const DistrFuncSelect = <FieldValues,>(props: DistrFuncSelectProps<FieldValues>) => {
    const [distrFuncName, setDistrFuncName] = useState<DISTR_FUNC | undefined>(undefined)
    const { onChange, value, ...otherProps } = props.field
    const onDistrFuncChange = (e?: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const selectedValue = e?.target.value
        props.updateParamsNum(selectedValue as DISTR_FUNC)
        onChange(e)
    }

    useEffect(() => {
        if (
            (distrFuncName !== undefined && value !== distrFuncName.toString())
            ||
            (distrFuncName === undefined)
        ) {
            const valueDistr = value as DISTR_FUNC
            setDistrFuncName(valueDistr)
            props.setCurrSelectedFunc(valueDistr)
        }
    }, [value, distrFuncName])

    return (distrFuncName !== undefined)
        ? <TextField
            sx={{ width: "100%" }}
            {...otherProps}
            value={distrFuncName.toString()}
            onChange={e => onDistrFuncChange(e)}
            error={props.fieldError !== undefined}
            helperText={props.fieldError?.message}
            label={props.label}
            variant="standard"
            select
        >
            {Object.values(DISTR_FUNC).map((item, index) => (
                <MenuItem key={`menu_item_${index}`} value={item}>{item}</MenuItem>
            ))}
        </TextField>
        : <></>
}

export default DistrFuncSelect;
