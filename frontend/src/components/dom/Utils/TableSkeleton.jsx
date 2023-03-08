import { Skeleton, Table } from 'antd';

const TableSkeleton = ({
  colCount,
  rowCount,
  style,
  rowStyle,
  noHeader = false,
}) => {
  const columns = Array(colCount)
    .fill()
    .map((_, i) => ({
      title: noHeader ? null : (
        <Skeleton active title={false} paragraph={{ rows: 1 }} />
      ),
      dataIndex: i,
      key: i,
      render: () => (
        <Skeleton
          active
          title={false}
          paragraph={{ rows: 1 }}
          style={rowStyle}
        />
      ),
    }));

  const rows = Array(rowCount)
    .fill()
    .map((_, i) => ({
      key: i,
    }));

  return (
    <Table
      columns={columns}
      dataSource={rows}
      style={style}
      pagination={false}
    />
  );
};

export default TableSkeleton;
