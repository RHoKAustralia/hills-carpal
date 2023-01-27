import React from 'react';
import DataTable, { SortOrder, TableColumn } from 'react-data-table-component';

interface Sort {
  column: string;
  direction: 'asc' | 'desc';
}

interface FetchState {
  filtered: string[];
  sorted: Sort;
  page: number;
  pageSize: number;
}
interface Props<T> {
  columns: TableColumn<T>[];
  fetchData: (state: FetchState) => Promise<{ rows: T[]; total: number }>;
  defaultSort: Sort;
  onRowClicked: (row: T, e: React.MouseEvent) => void;
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
  const [data, setData] = React.useState<T[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [sort, setSort] = React.useState<{
    column: string;
    direction: 'asc' | 'desc';
  }>(props.defaultSort);

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const response = await props.fetchData({
          page,
          filtered: [],
          sorted: sort,
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
  }, [page, perPage, sort]);

  const onChangePage = (page: number) => {
    setPage(page);
  };

  const onPerRowsChange = (newPerPage: number, page: number) => {
    setPage(page);
    setPerPage(newPerPage);
  };

  const onSort = (selectedColumn: TableColumn<T>, sortDirection: SortOrder) => {
    setSort({ column: selectedColumn.id.toString(), direction: sortDirection });
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
          sortServer
          defaultSortFieldId={sort.column}
          defaultSortAsc={sort.direction === 'asc'}
          onSort={onSort}
          onRowClicked={props.onRowClicked}
          pointerOnHover={true}
        />
      )}
    </div>
  );
};

export default Table;
