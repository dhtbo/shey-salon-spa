import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'
import Loader from './loader'

interface Column {
  key: string
  label: string
  className?: string
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: any) => void
  renderCell?: (item: any, column: Column) => React.ReactNode
}

function DataTable({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = "暂无数据",
  onRowClick,
  renderCell
}: DataTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-gray-50">
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow 
              key={item.id || index} 
              className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {renderCell ? renderCell(item, column) : item[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default DataTable