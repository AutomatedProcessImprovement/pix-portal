import React from 'react';
import { Select, MenuItem, Typography, Paper } from '@material-ui/core';


interface BatchingProps {
    data: {
        activity: string;
        batch_frequency?: number;
        duration_distribution?: { [key: string]: number };
        firing_rules: {
            confidence?: number;
            rules: Rule[][];
            support?: number;
        };
        resources?: string[];
        size_distribution?: { [key: string]: number };
        type?: string;
    }[];
    defaultActivity?: string;
}

interface Rule {
    attribute: string;
    comparison: string;
    value: string[] | string;
}

export default function BatchingComponent(props: BatchingProps) {
    const [selectedActivity, setSelectedActivity] = React.useState(
        props.defaultActivity ||
        (props.data && props.data.length > 0 ? props.data[0].activity : "N/A")
    );

    const currentActivity = props.data.find((item: { activity: string }) => item.activity === selectedActivity) || {
        caseFrequency: 'N/A',
        batch_frequency: 'N/A',
        type: [],
        firing_rules: { rules: [] }
    };

    const rules: Rule[][] = currentActivity.firing_rules?.rules || [];

    return (
        <div>
            <Select
                value={selectedActivity}
                onChange={(e: React.ChangeEvent<{ value: unknown }>) => setSelectedActivity(e.target.value as string)}
            >
                {props.data && props.data.length > 0 ? (
                    props.data.map((item: { activity: string }) =>
                        <MenuItem key={item.activity} value={item.activity}>{item.activity}</MenuItem>
                    )
                ) : (
                    <MenuItem value="N/A">N/A</MenuItem>
                )}
            </Select>

            <Paper style={{ marginTop: '20px', padding: '16px' }}>
                <Typography variant="body1">Case frequency: N/A</Typography>
                <Typography variant="body1">Batch processing frequency: {currentActivity.batch_frequency || 'N/A'}</Typography>
                <Typography variant="body1">Batch processing type: {currentActivity.type || 'N/A'}</Typography>
                <Typography variant="body1">
                    Activation rule:
                    {rules && rules.length > 0 ? (
                        <span>
            [
                            {rules.flatMap((ruleGroup: Rule[], idx: number) =>
                                    ruleGroup.map((rule: Rule, idxInner: number) => {
                                        const value = Array.isArray(rule.value)
                                            ? rule.value.join(" - ").trim()
                                            : rule.value;
                                        return (
                                            <React.Fragment key={idx * 100 + idxInner}>
                            <span>
                                {rule.attribute || 'N/A'} {rule.comparison || 'N/A'} {value || "N/A"}
                            </span>
                                                {(idx !== rules.length - 1 || idxInner !== ruleGroup.length - 1) && ", "}
                                            </React.Fragment>
                                        );
                                    })
                            )}
                            ]
        </span>
                    ) : "N/A"}
                </Typography>
            </Paper>
        </div>
    );
}
