import { useState, type FC, useEffect, useRef } from "react"
import { type Control, Controller } from "react-hook-form"
import { Button, Chip, Container, Grid, TextField } from "@mui/material"
import {
    REQUIRED_ERROR_MSG,
    SHOULD_BE_GREATER_0_MSG,
} from "../validationMessages"
import { type ConsJsonData } from "../../JsonData"
import Selecto from "react-selecto"

const selectionIndexesToBitmask = (indexes: number[]) => {
    let mask = 0
    indexes.forEach((i) => (mask |= 1 << i))
    return mask
}

const bitmaskToSelectionIndexes = (mask: number) => {
    const indexes = []
    for (let i = 0; i < 24; i++) {
        if (mask & (1 << i)) indexes.push(i)
    }
    return indexes
}

interface Props {
    control: Control<ConsJsonData, object>
    index: number
    field: keyof ConsJsonData["resources"][0]["constraints"]["never_work_masks"]
    collection: "never_work_masks" | "always_work_masks"
}
export const ConstraintMaskInput: FC<Props> = (props) => {
    const { control, index, collection, field } = props
    const selectoRef = useRef<Selecto | null>(null)

    const containerClass = `elements-${collection}-${field}`

    return (
        <Controller
            name={`resources.${index}.constraints.${collection}.${field}`}
            control={control}
            rules={{
                required: REQUIRED_ERROR_MSG,
                min: {
                    value: 1,
                    message: SHOULD_BE_GREATER_0_MSG,
                },
            }}
            render={({ field: { onChange, value } }) => {
                const [selectedIndexes, setSelectedIndexes] = useState<
                    number[]
                >(bitmaskToSelectionIndexes(value))

                const onSelectChange = (
                    selection: Array<HTMLElement | SVGElement>,
                    triggerSelecto = false
                ) => {
                    if (triggerSelecto)
                        selectoRef.current?.setSelectedTargets(selection)
                    const indexes = selection.map((el) =>
                        parseInt(el.dataset.index!)
                    )
                    setSelectedIndexes(indexes)
                    onChange(selectionIndexesToBitmask(indexes))
                }
                return (
                    <Grid item xs={12} className={containerClass}>
                        <Selecto
                            ref={selectoRef}
                            dragContainer={`.${containerClass}`}
                            selectableTargets={[`.${containerClass} .element`]}
                            hitRate={20}
                            selectFromInside={true}
                            selectByClick={true}
                            continueSelect={true}
                            onSelect={(e) => onSelectChange(e.selected)}
                        ></Selecto>
                        <h4 style={{ textTransform: "capitalize" }}>
                            {field}{" "}
                            <Button
                                onClick={() => {
                                    selectoRef.current?.setSelectedTargets([])
                                    setSelectedIndexes([])
                                }}
                                size="small"
                            >
                                Clear
                            </Button>{" "}
                        </h4>
                        <Grid container spacing={1}>
                            {Array.from({ length: 24 }, (_, i) => (
                                <Grid
                                    item
                                    key={i}
                                    xs={1}
                                    className="element"
                                    data-index={i}
                                >
                                    <div
                                        style={{
                                            textAlign: "center",
                                            cursor: "pointer",
                                            padding: "2px",
                                            backgroundColor:
                                                selectedIndexes.includes(i)
                                                    ? "chocolate"
                                                    : undefined,
                                        }}
                                    >
                                        {i.toString().padStart(2, "0")}
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                )
            }}
        ></Controller>
    )
}
