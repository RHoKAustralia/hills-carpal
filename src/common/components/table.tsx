import React from 'react';
import DataGrid, { Column } from 'react-data-grid';

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
}

const Table = <T,>(props: Props<T>) => {
  // const table = useTable({
  //   filterable: !!props.filterable,
  //   data: props.data,
  //   defaultPageSize: 10,
  //   columns: props.columns,
  //   width: '100%',
  //   ...props,
  // });

  return <DataGrid columns={props.columns} rows={props.rows} />;
};

export default Table;
