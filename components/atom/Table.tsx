import React, { FC } from "react";
import { Table } from "antd";
import type { TableProps } from "antd/es/table";

export type CoreTableProps<RecordType extends object = any> = Omit<
  TableProps<RecordType>,
  "pagination"
> & {
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange?: (page: number, pageSize: number) => void;
    showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  };
  rowKey?: string | ((record: RecordType, index: number) => string);
};

export const TableApp = <RecordType extends object>({
  dataSource,
  columns,
  pagination,
  rowKey,
  loading = false,
  onChange,
  ...rest
}: CoreTableProps<RecordType>) => {
  return (
    <Table<RecordType>
      rowKey={
        rowKey ??
        ((record: any, index) => {
          return record?.id ?? index;
        })
      }
      dataSource={dataSource}
      columns={columns}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: pagination.onChange,
        showSizeChanger: true
      }}
      loading={loading}
      onChange={onChange}
      {...rest}
    />
  );
};
