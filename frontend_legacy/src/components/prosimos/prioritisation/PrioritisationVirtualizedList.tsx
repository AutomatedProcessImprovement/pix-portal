import { useRef } from "react"
import { AutoSizer, List } from "react-virtualized"

type PrioritisationVirtualizedListProps = {
    rowCount: number
    renderRow: ({ index, key, style }: any) => JSX.Element
    overscanRowCount: number
    rowHeight: number
}

const PrioritisationVirtualizedList = ({ rowCount, renderRow, overscanRowCount, rowHeight }: PrioritisationVirtualizedListProps) => {
    const listRef = useRef<List>(null)

    return (
        <AutoSizer>
            {({ width, height }) => {
                return <List
                    ref={listRef}
                    width={width}
                    height={height}
                    rowHeight={rowHeight}
                    rowRenderer={renderRow}
                    rowCount={rowCount}
                    overscanRowCount={overscanRowCount}
                />
            }}
        </AutoSizer>
    )
}

export default PrioritisationVirtualizedList;
