import React from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';

interface FetchState {
  filtered: string[];
  sorted: { id: string; desc: boolean }[];
  page: number;
  pageSize: number;
}

interface Props<T> {
  columns: TableColumn<T>[];
  fetchData: (state: FetchState) => Promise<{ rows: T[]; total: number }>;
}

const customStyles = {
  head: {
    style: {
      fontSize: '16px',
    },
  },
  rows: {
    style: {
      fontSize: '16px',
    },
  },
};

const Table = <T,>(props: Props<T>) => {
  // const table = useTable({
  //   filterable: !!props.filterable,
  //   data: props.data,
  //   defaultPageSize: 10,
  //   columns: props.columns,
  //   width: '100%',
  //   ...props,
  // });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [data, setData] = React.useState([]);
  const [totalRows, setTotalRows] = React.useState(0);

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const response = await props.fetchData({
          page,
          filtered: [],
          sorted: [],
          pageSize: perPage,
        });

        setData(response.rows);
        setTotalRows(response.total);
      } catch (e) {
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, perPage])

  const onChangePage = (page: number) => {
    setPage(page);
  };

  const onPerRowsChange = (newPerPage: number, page: number) => {
    setPage(page);
    setPerPage(newPerPage);
  };

  return (
    <div>
      {error ? (
        <div>Error {error.message}</div>
      ) : (
        <DataTable
          columns={props.columns}
          data={data}
          striped={true}
          progressPending={loading}
          pagination={true}
          paginationServer={true}
          customStyles={customStyles}
          paginationTotalRows={totalRows}
          onChangePage={onChangePage}
          onChangeRowsPerPage={onPerRowsChange}
        />
      )}
    </div>
  );
};

export default Table;
