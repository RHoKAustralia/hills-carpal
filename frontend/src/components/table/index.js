import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

const Table = props => {
  return (
    <BootstrapTable keyField="id" data={props.data} columns={props.columns} />
  );
};

export default Table;
