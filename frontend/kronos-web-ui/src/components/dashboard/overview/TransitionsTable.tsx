import * as React from 'react';
import {useEffect, useState} from 'react';
import {DataGrid, GridColDef, GridEventListener, GridToolbar} from '@mui/x-data-grid';
import RowDialog from "../RowDialog";
import {useFetchData} from "../../../helpers/useFetchData"

var moment = require("moment");
require("moment-duration-format");

const columns: GridColDef[] = [
    {field: 'id', headerName: 'ID', flex: 0.01, hide: true},
    {field: 'source_activity', headerName: 'Source activity', flex: 0.015},
    {field: 'target_activity', headerName: 'Target activity', flex: 0.015},
    {
        field: 'total_wt',
        headerName: 'Total waiting time',
        flex: 0.01,
        type: 'number',
        valueFormatter: params =>
            moment.duration(params?.value, 'seconds').format('d[D] HH[H] mm[M]')
    },
    {
        field: 'batching_wt',
        headerName: 'Batching',
        flex: 0.01,
        type: 'number',
        valueFormatter: params =>
            moment.duration(params?.value, 'seconds').format('d[D] HH[H] mm[M]')
    },
    {
        field: 'prioritization_wt',
        headerName: 'Prioritization',
        flex: 0.01,
        type: 'number',
        valueFormatter: params =>
            moment.duration(params?.value, 'seconds').format('d[D] HH[H] mm[M]')
    },
    {
        field: 'contention_wt',
        headerName: 'R. contention',
        flex: 0.01,
        type: 'number',
        valueFormatter: params =>
            moment.duration(params?.value, 'seconds').format('d[D] HH[H] mm[M]')
    },
    {
        field: 'unavailability_wt',
        headerName: 'R. unavailability',
        flex: 0.01,
        type: 'number',
        valueFormatter: params =>
            moment.duration(params?.value, 'seconds').format('d[D] HH[H] mm[M]')
    },
    {
        field: 'extraneous_wt',
        headerName: 'Extraneous',
        flex: 0.01,
        type: 'number',
        valueFormatter: params =>
            moment.duration(params?.value, 'seconds').format('d[D] HH[H] mm[M]')
    },
];

const add_index = (data: any) => {
    for (let i = 0; i < data.length; i++) {
        data[i].id = i + 1
    }
    return data
}

export default function TransitionsTable({data}: { data: any }) {
    const [table_data, setTableData] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string[]>([]);
    const [selectedTitle, setSelectedTitle] = useState<string>("");

    useEffect(() => {
        if (data) {
            setTableData(add_index(data));
        }
    }, [data]);

    const handleClose = () => {
        setOpen(false);
    };

    const onEvent: GridEventListener<'rowDoubleClick'> = (
        params,
    ) => {
        setOpen(true);
        setSelectedValue(params.row.wt_by_resource as string[]);
        setSelectedTitle(params.row.source_activity + " - " + params.row.target_activity);
    }

    return (
        <>
            <DataGrid
                autoHeight={true}
                rows={table_data}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                components={{Toolbar: GridToolbar}}
                onRowDoubleClick={onEvent}
                initialState={{
                    sorting: {
                        sortModel: [{field: 'total_wt', sort: 'desc'}],
                    },
                }}
            />
            <RowDialog
                open={open}
                onClose={handleClose}
                selectedValue={add_index(selectedValue)}
                selectedTitle={selectedTitle}
                type={0}/>
        </>
    );
}
