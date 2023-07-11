import {
    useFieldArray,
    Controller,
    get,
    UseFormReturn
} from "react-hook-form";

import {
    TextField,
    MenuItem,
    Chip,
    IconButton,
    Tooltip,
    FormHelperText,
    Theme
} from "@mui/material";
import { makeStyles } from 'tss-react/mui';
import QueryGroupIcon from '@mui/icons-material/AccountTreeRounded';
import QueryConditionIcon from '@mui/icons-material/FunctionsRounded';
import RemoveIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import { batchingSchema, PrioritisationBuilderSchema, typeOperatorMap, EligibleBuilderSchemas, getRuleStatementsWithDefaultValues } from "./schemas";
import { JsonData } from "../formData";
import WeekdaySelect from "../calendars/WeekdaySelect";
import BetweenInputs from "./BetweenInputs";
import { ChangeEvent, useState, useEffect, ChangeEventHandler } from "react";
import QueryValueDiscreteSelect from "./QueryValueDiscreteSelect";
import { UpdateAndRemovePrioritisationErrors } from "../simulationParameters/usePrioritisationErrors";

const useQueryBuilderStyles = makeStyles<void, 'group' | 'cond'>({
    name: "QueryBuilder"
})((theme: Theme, _params, classes) => ({
    group: {},
    groupControls: {},
    nested: {
        paddingLeft: 30
    },
    cond: {
        display: "flex"
    },
    item: {
        position: "relative",

        "&:first-child:before": {
            top: -8,
            height: 50
        },
        "&::before, &:not(:last-child)::after": {
            height: 20,
            // borderColor: theme.palette.secondary.light,
            borderStyle: "solid",
            borderWidth: `0 0 1px 1px`,
            content: `''`,
            left: -15,
            // left: 40,
            position: "absolute",
            width: 13
        },
        "&:not(:last-child)::after": {
            height: "50%",
            left: -15,
            bottom: 0,
            borderBottom: "none"
        },
        [`&.${classes.group}`]: {
            "&::before": {
                height: 30
            },
            "&::first-child::before": {
                height: 27
            },
            "&:not(:last-child)::after": {
                height: `calc(100% - 23px)`
            },
            "&::last-child::before": {
                height: 27
            },
            "&::last-child::after": {
                height: `calc(100% - 23px)`
            }
        },
        [`&.${classes.cond}`]: {
            "&::before": {
                height: 45
            },
            "&:first-child::before": {
                top: -4,
                height: 49
            },
            "&:not(:last-child)::after": {
                height: `calc(100% - 38px)`
            }
        }
    }
}));

interface QueryBuilderProps {
    formState: UseFormReturn<JsonData, object>;
    name: string;
    builderSchema?: PrioritisationBuilderSchema; // we use default one for Batching
    possibleValueOptions?: {}
    updateAndRemovePrioritisationErrors?: UpdateAndRemovePrioritisationErrors
}


export const QueryBuilder = (props: QueryBuilderProps) => {
    const { builderSchema, ...otherProps } = props
    const [optionsWithType, setOptionsWithType] = useState<EligibleBuilderSchemas>({})

    useEffect(() => {
        let options = builderSchema
        if (options === undefined || Object.keys(options).length === 0) {
            // we use default options/schema (batch firing rules)
            options = batchingSchema
        }

        if (options !== optionsWithType) {
            setOptionsWithType(options)
        }
    }, [builderSchema])

    return (
        <QueryGroup
            {...otherProps}
            builderSchema={optionsWithType}
        />
    );
};

interface QueryGroupProps {
    name: string;
    formState: any;
    builderSchema: EligibleBuilderSchemas;
    depth?: number;
    onRemove?: () => any;
    possibleValueOptions?: {}
    updateAndRemovePrioritisationErrors?: UpdateAndRemovePrioritisationErrors
}

export type FieldsPath = "query.items" | `query.items.${number}.items` | `query.items.${number}.items.${number}.items`

export const QueryGroup = (allProps: QueryGroupProps) => {
    const {
        name,
        formState,
        builderSchema,
        depth = 0,
        onRemove,
        possibleValueOptions,
        updateAndRemovePrioritisationErrors,
        ...props
    } = allProps
    const { classes, cx } = useQueryBuilderStyles();

    const arrayPath = name
    const { control, formState: { errors }, setError, clearErrors } = formState
    const { fields, append, remove } = useFieldArray({
        control,
        name: arrayPath
    });

    const err = get(errors, arrayPath, null)

    const onAddingNewEntity = (isAddingGroup: boolean) => {
        // isAddingGroup: bool - adding either group or individual condition

        clearErrors(arrayPath)

        const condition = getRuleStatementsWithDefaultValues(builderSchema)
        const finalEntity = isAddingGroup ? [condition] : condition
        append(finalEntity)
    }

    return (
        <div className={cx({ [classes.item]: depth > 0 }, classes.group)}
            {...props}
        >
            <div className={classes.groupControls}>
                {depth === 0
                    ? <Chip label="OR" variant="outlined" />
                    : <Chip label="AND" variant="outlined" />}

                {/* group could be added only on the very first level */}
                {depth === 0
                    ? (
                        <Tooltip title="Add Logical Group">
                            <IconButton
                                onClick={() => onAddingNewEntity(true)}
                            >
                                <QueryGroupIcon />
                            </IconButton>
                        </Tooltip>
                    )
                    : (
                        <Tooltip title="Add Condition">
                            <IconButton
                                onClick={() => onAddingNewEntity(false)}
                            >
                                <QueryConditionIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                {onRemove ? (
                    <Tooltip title="Remove This Group">
                        <IconButton onClick={onRemove}>
                            <RemoveIcon />
                        </IconButton>
                    </Tooltip>
                ) : null}
            </div>

            {!err ? null : (
                <FormHelperText error style={{ marginBottom: 4 }}>
                    {err.message}
                </FormHelperText>
            )}

            <div className={classes.nested}>
                {fields.map((field, index) => {
                    // isMultipleStatements = True and allKeysNum = True in case we have Group
                    // otherwise, we have only one statement in the group which equals to just condition
                    const allKeysNum = Object.keys(field).every(v => (v === 'id') ? true : !isNaN(Number(v)))
                    const isMultipleStatements = Object.keys(field).length > 1

                    return allKeysNum && isMultipleStatements ? (
                        <QueryGroup
                            key={field.id}
                            depth={depth + 1}
                            name={`${name}.${index}`}
                            builderSchema={builderSchema}
                            formState={formState}
                            onRemove={() => remove(index)}
                            possibleValueOptions={possibleValueOptions}
                            updateAndRemovePrioritisationErrors={updateAndRemovePrioritisationErrors}
                        />
                    ) : (
                        <QueryCondition
                            key={field.id}
                            formState={formState}
                            name={`${name}.${index}`}
                            builderSchema={builderSchema}
                            onRemove={() => remove(index)}
                            possibleValueOptions={possibleValueOptions}
                            updateAndRemovePrioritisationErrors={updateAndRemovePrioritisationErrors}
                        />
                    )
                })}
            </div>
        </div>
    );
};

interface QueryConditionProps {
    name: string;
    formState: any;
    builderSchema: EligibleBuilderSchemas;
    onRemove: () => any;
    possibleValueOptions?: {}
    updateAndRemovePrioritisationErrors?: UpdateAndRemovePrioritisationErrors
}

const QueryCondition = (allProps: QueryConditionProps) => {
    const { name,
        formState,
        builderSchema,
        onRemove,
        possibleValueOptions,
        updateAndRemovePrioritisationErrors,
        ...props } = allProps

    const { control, watch, formState: { errors }, setValue, clearErrors } = formState
    const { classes, cx } = useQueryBuilderStyles();

    const conditionFieldName = `${name}.attribute`
    const conditionOperatorName = `${name}.comparison`
    const conditionValueName = `${name}.value`

    const conditionFieldError = get(errors, conditionFieldName, null);
    const conditionOperatorError = get(errors, conditionOperatorName, null);
    const conditionValueError = get(errors, conditionValueName, null);

    // watch the value of the field
    const fieldValue = watch(conditionFieldName);
    const operatorValue = watch(conditionOperatorName);

    // dynamic operator and values
    const fieldTypeSchema = (builderSchema as any)[fieldValue];
    const typeOperator = (typeOperatorMap as any)[fieldTypeSchema?.type];
    const valueOpts = (typeOperator as any)?.[operatorValue];

    const getHelperTextForInputValue = () => {
        const errorMessage = conditionValueError?.message
        if (errorMessage !== undefined) {
            return errorMessage
        }

        if (fieldTypeSchema.type === 'hour') {
            return "Enter value from 0 to 24"
        }
    }

    const nullifyValueAndClearErrors = (pathToField: string) => {
        setValue(pathToField, "")
        clearErrors(pathToField)
    }

    const onFieldChange = (
        event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
        onChange: any
    ) => {
        // change the value
        onChange(event)

        // nullify the operator and set of values
        nullifyValueAndClearErrors(conditionOperatorName)
        nullifyValueAndClearErrors(conditionValueName)
    }

    const getLabelForValue = (fieldTypeSchema: string) => {
        switch (fieldTypeSchema) {
            case "waiting_time":
                return "Value (sec)"
            default:
                return "Value"
        }
    }

    const getValueComponent = () => {
        switch (fieldTypeSchema.type) {
            case 'weekday':
                return <Controller
                    name={conditionValueName}
                    control={control}
                    render={({ field }) => (
                        <WeekdaySelect
                            field={field}
                            label="Value"
                            style={{ ml: 1.875, mt: 2, flex: 1 }}
                            fieldError={conditionValueError}
                        />
                    )}
                />
            case 'priority_discrete':
                const allPossibleOptions = (possibleValueOptions as any)?.[fieldValue] ?? []
                return <QueryValueDiscreteSelect
                    conditionValueName={conditionValueName}
                    fieldError={conditionValueError}
                    formState={formState}
                    allPossibleOptions={allPossibleOptions}
                    style={{ ml: 1.875, mt: 2, flex: 1 }}
                    updateAndRemovePrioritisationErrors={updateAndRemovePrioritisationErrors!!}
                />
            default:
                return valueOpts?.multiple
                    ? (
                        <Controller
                            key={`${typeOperator.label}-multiple`}
                            control={control}
                            name={conditionValueName}
                            defaultValue={[]}
                            render={({
                                field: { onChange, value }
                            }) => {
                                return <BetweenInputs
                                    value={value}
                                    onChange={onChange}
                                    conditionValueError={conditionValueError}
                                    label={getLabelForValue(fieldTypeSchema.type)}
                                />
                            }}
                        />
                    )
                    : (
                        <Controller
                            key={`${typeOperator.label}-single`}
                            control={control}
                            name={conditionValueName}
                            defaultValue={""}
                            rules={{ required: "Required" }}
                            render={({
                                field: { onChange, value }
                            }) => (
                                <TextField
                                    label={getLabelForValue(fieldTypeSchema.type)}
                                    margin="normal"
                                    type="text"
                                    onChange={onChange}
                                    style={{ flex: 1, marginLeft: 15 }}
                                    error={!!conditionValueError}
                                    helperText={getHelperTextForInputValue()}
                                    value={value}
                                    variant="standard"
                                />
                            )}
                        />
                    )
        }

    }

    const onOperatorComparisionChange = (
        onChange: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>,
        newValue: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        // nullify the previous value of the rule
        nullifyValueAndClearErrors(conditionValueName)

        // change the comparison operator
        onChange(newValue)
    }

    return (
        <div className={cx(classes.item, classes.cond)}
            {...props}
        >
            <Controller
                control={control}
                name={conditionFieldName}
                defaultValue={""}
                rules={{ required: "Required" }}
                render={({
                    field: { onChange, value }
                }) => (
                    <TextField
                        select
                        label="Field"
                        style={{ width: 220 }}
                        margin="normal"
                        error={!!conditionFieldError}
                        helperText={conditionFieldError?.message}
                        onChange={e => onFieldChange(e, onChange)}
                        value={value}
                        variant="standard"
                    >
                        {Object.entries(builderSchema).map(([key, item]) => {
                            return (
                                <MenuItem key={key} value={key}>
                                    {item.label}
                                </MenuItem>
                            );
                        })}
                    </TextField>
                )}
            />

            {fieldValue === "" || !typeOperator
                ? null
                : (
                    <>
                        <Controller
                            key={typeOperator.label}
                            control={control}
                            name={conditionOperatorName}
                            defaultValue={""}
                            rules={{ required: "Required" }}
                            render={({
                                field: { onChange, value }
                            }) => (
                                <TextField
                                    select
                                    label="Operator"
                                    margin="normal"
                                    style={{ width: 220, marginLeft: 15 }}
                                    error={!!conditionOperatorError}
                                    helperText={conditionOperatorError?.message}
                                    onChange={e => onOperatorComparisionChange(onChange, e)}
                                    value={value}
                                    variant="standard"
                                >
                                    {Object.keys(typeOperator).map((value, index, array) => {
                                        const item = (typeOperator as any)[value];
                                        return (
                                            <MenuItem key={value} value={value}>
                                                {item.label}
                                            </MenuItem>
                                        );
                                    })}
                                </TextField>
                            )}
                        />

                        {getValueComponent()}
                    </>
                )}

            <span
                style={{
                    alignSelf: "flex-start",
                    display: "flex",
                    alignItems: "center",
                    margin: `16px 0 30px 10px`
                }}
            >
                <Tooltip title="Remove Condition">
                    <IconButton onClick={onRemove}>
                        <RemoveIcon />
                    </IconButton>
                </Tooltip>
            </span>
        </div>
    );
};
