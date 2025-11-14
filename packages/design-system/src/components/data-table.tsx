"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown } from "lucide-react"

import { cn } from "../lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu"

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  enableSorting?: boolean
  enablePagination?: boolean
  enableRowSelection?: boolean
  enableColumnVisibility?: boolean
  pageSize?: number
  onRowClick?: (row: TData) => void
  emptyState?: React.ReactNode
  className?: string
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  enableSorting = true,
  enablePagination = true,
  enableRowSelection = false,
  enableColumnVisibility = false,
  pageSize = 10,
  onRowClick,
  emptyState,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnVisibilityChange: enableColumnVisibility ? setColumnVisibility : undefined,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    enableRowSelection: enableRowSelection,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnVisibility: enableColumnVisibility ? columnVisibility : undefined,
      rowSelection: enableRowSelection ? rowSelection : undefined,
      pagination: enablePagination ? { pageIndex: 0, pageSize } : undefined,
    },
    initialState: {
      pagination: enablePagination ? { pageIndex: 0, pageSize } : undefined,
    },
  })

  // Handle empty state
  if (data.length === 0 && emptyState) {
    return <div className={cn("w-full", className)}>{emptyState}</div>
  }

  return (
    <div className={cn("space-y-4", className)}>
      {enableColumnVisibility && (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = enableSorting && header.column.getCanSort()
                  return (
                    <TableHead
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      onKeyDown={
                        canSort
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                header.column.getToggleSortingHandler()?.(e)
                              }
                            }
                          : undefined
                      }
                      tabIndex={canSort ? 0 : undefined}
                      className={cn(
                        canSort && "cursor-pointer select-none hover:bg-muted/50"
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center space-x-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {canSort && (
                            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={enableRowSelection && row.getIsSelected() ? "selected" : undefined}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyState || "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination && table.getPageCount() > 1 && (
        <DataTablePagination table={table} />
      )}

      {enableRowSelection && (
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      )}
    </div>
  )
}

DataTable.displayName = "DataTable"

export interface DataTablePaginationProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Rows per page</p>
        <select
          className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm"
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  )
}

DataTablePagination.displayName = "DataTablePagination"
