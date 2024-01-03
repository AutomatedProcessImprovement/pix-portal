import * as React from 'react';
import {
    DataGrid,
    GridColDef,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridToolbarFilterButton
} from '@mui/x-data-grid';
import RowDialog from '../RowDialog';
import {Typography} from "@mui/material";
import {useFetchData} from '../../../helpers/useFetchData';

const columns: GridColDef[] = [
    {field: 'id', headerName: 'ID', hide: true, flex: 0.01},
    {field: 'source_activity', headerName: 'Source activity', flex: 0.05},
    {field: 'target_activity', headerName: 'Target activity', flex: 0.05},
    // {
    //     field: 'case_freq',
    //     headerName: 'Case frequency',
    //     type: 'number',
    //     flex:0.02,
    //     valueFormatter: params =>
    //         ((params?.value).toFixed(2) ) + "%"
    // },
    // {
    //     field: 'total_freq',
    //     headerName: 'Total frequency',
    //     type: 'number',
    //     flex:0.02
    // },
    {
        field: 'cte_impact_total',
        headerName: 'Total waiting time',
        flex: 0.02,
        type: 'number',
        valueFormatter: params =>
            ((params?.value).toFixed(2)) + "%"
    },
    {
        field: 'batching_impact',
        headerName: 'Batching',
        flex: 0.02,
        type: 'number',
        valueGetter: params =>
            params.row.cte_impact.batching_impact,
        valueFormatter: params =>
            ((params?.value).toFixed(2)) + "%"
    },
    {
        field: 'prioritization_impact',
        headerName: 'Prioritization',
        flex: 0.02,
        type: 'number',
        valueGetter: params =>
            params.row.cte_impact.prioritization_impact,
        valueFormatter: params =>
            ((params?.value).toFixed(2)) + "%"

    },
    {
        field: 'contention_impact',
        headerName: 'R. contention',
        flex: 0.02,
        type: 'number',
        valueGetter: params =>
            params.row.cte_impact.contention_impact,
        valueFormatter: params =>
            ((params?.value).toFixed(2)) + "%"
    },
    {
        field: 'unavailability_impact',
        headerName: 'R. unavailability',
        flex: 0.02,
        type: 'number',
        valueGetter: params =>
            params.row.cte_impact.unavailability_impact,
        valueFormatter: params =>
            ((params?.value).toFixed(2)) + "%"
    },
    {
        field: 'extraneous_impact',
        headerName: 'Extraneous',
        flex: 0.02,
        type: 'number',
        valueGetter: params =>
            params.row.cte_impact.extraneous_impact,
        valueFormatter: params =>
            ((params?.value).toFixed(2)) + "%"
    },

];
const add_index_and_pt = (data: any, global_total_pt: number, global_total_wt: number) => {
    for (let i = 0; i < data.length; i++) {
        data[i].id = i + 1
        data[i].new_cte = global_total_pt / (global_total_pt + global_total_wt - data[i].total_wt)
    }
    return data
}

const add_index = (data: any) => {
    for (let i = 0; i < data.length; i++) {
        data[i].id = i + 1
    }
    return data
}

export default function CTETable({data}: { data: any }) {
    let [open, setOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState<string[]>([]);
    const [selectedTitle, setSelectedTitle] = React.useState<string>("");

    let table_data = add_index(data.data)

    const handleClose = () => {
        setOpen(false);
    };

    // const onEvent: GridEventListener<'rowDoubleClick'> = (
    //     params, // GridRowParams
    // ) => {
    //     setOpen(true)
    //     setSelectedValue(params.row.wt_by_resource as string[])
    //     setSelectedTitle(params.row.source_activity + " - " + params.row.target_activity )
    // }

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton/>
                <GridToolbarFilterButton/>
                <GridToolbarDensitySelector/>
                {/*<GridToolbarHeatmap/>*/}
            </GridToolbarContainer>
        );
    }

    return (
        <>
            <Typography variant="h5" component="div" sx={{fontSize: 18}}>
                Potential CTE improvement per transition and waiting time cause
            </Typography>
            <DataGrid
                autoHeight={true}
                rows={table_data}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                components={{Toolbar: CustomToolbar}}
                // onRowDoubleClick={onEvent}
                initialState={{
                    sorting: {
                        sortModel: [{field: 'cte_impact_total', sort: 'desc'}],
                    },
                }}
                componentsProps={{
                    panel: {
                        sx: {

                            '& .MuiTypography-root': {
                                color: 'dodgerblue',
                                fontSize: 15,
                            },
                            '& .MuiButton-root': {
                                fontSize: 15
                            }
                        },
                    },
                }}
            />
            <RowDialog
                open={open}
                onClose={handleClose}
                selectedValue={add_index_and_pt(selectedValue, data.total_pt, data.total_wt)}
                selectedTitle={selectedTitle}
                type={1}/>
            {/*<TableHeatmap*/}
            {/* onClose={handleHeatmapClose} open={heatmapOpen} values={table_data} p_cte={data.data.process_cte} />*/}
        </>
    );
}