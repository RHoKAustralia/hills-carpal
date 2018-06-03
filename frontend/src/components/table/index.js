import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

const Table = props => {
  return (
    <ReactTable
      {...props}
      filterable
      className="-striped -highlight"
      data={props.data}
      defaultPageSize={10}
      columns={props.columns}
    />
  );
};

export default Table;
