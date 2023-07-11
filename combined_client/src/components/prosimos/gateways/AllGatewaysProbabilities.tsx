import { Card, Grid } from "@mui/material";
import { JsonData } from "../formData";
import GatewayProbabilities from "./GatewayProbabilities";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Gateways } from "../modelData";
import { List , AutoSizer } from 'react-virtualized';

interface GatewayBranchingProbProps {
    formState: UseFormReturn<JsonData, object>
    gateways: Gateways
}

const AllGatewaysProbabilities = (props: GatewayBranchingProbProps) => {
    const { formState: { control: formControl }, gateways } = props
    const { fields } = useFieldArray({
        keyName: 'key',
        control: formControl,
        name: `gateway_branching_probabilities`
    })

    const renderRow = ({ index, key, style }: any) => {
        const item = fields[index]
        const gatewayKey = item.gateway_id

        return <Grid key={`${gatewayKey}Grid`} item xs={12} style={style}>
            <Card elevation={5} sx={{ m: 1, p: 1 }}>
                <GatewayProbabilities
                    gatewayKey={gatewayKey}
                    index={index}
                    formState={props.formState}
                    gateway={gateways?.[gatewayKey]}
                />
            </Card>
        </Grid>
    }

    return (
        <Grid item xs={12} container spacing={2}>
            <Grid item container xs={12} style={{ minHeight: "60vh" }}>
                <AutoSizer>
                    {({ width, height }) => {
                        return <List
                            width={width}
                            height={height}
                            rowHeight={240}
                            rowRenderer={renderRow}
                            rowCount={fields.length}
                            overscanRowCount={5}
                        />
                    }}
                </AutoSizer>
            </Grid>
        </Grid>
    )
}

export default AllGatewaysProbabilities;