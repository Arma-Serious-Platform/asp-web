'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/moleculas/table';
import { Button } from '../../atoms/button';

import { LoaderIcon } from 'lucide-react';
import classNames from 'classnames';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total?: number;
  isLoading?: boolean;
  onLoadMore?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total = 0,
  isLoading = false,
  onLoadMore,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const headerGroups = table.getHeaderGroups();
  const hasActions = headerGroups.some((headerGroup) =>
    headerGroup.headers.some((header) => header.id === 'actions')
  );

  return (
    <div className='overflow-hidden border relative'>
      <Table>
        <TableHeader className='sticky top-0 z-10'>
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                return (
                  <TableHead
                    key={header.id}
                    className={classNames({
                      'sticky right-0':
                        index === headerGroup.headers.length - 1 && hasActions,
                    })}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className={classNames('h-24 text-center w-full', {
                  'sticky right-0': hasActions,
                })}>
                <div className='flex justify-center items-center h-full'>
                  <LoaderIcon className='w-8 h-8 animate-spin' />
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                Не знайдено результатів
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {!isLoading && data.length > 0 && (
          <TableFooter>
            <TableRow className='hover:bg-transparent'>
              <TableCell colSpan={columns.length}>
                <div className='flex items-center'>
                  {total > 0 && data.length > 0 && (
                    <div>
                      Показано: {data.length} з {total}
                    </div>
                  )}

                  {total !== data.length && onLoadMore && (
                    <Button
                      className='ml-4'
                      variant='outline'
                      size='sm'
                      onClick={onLoadMore}>
                      Показати більше
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
