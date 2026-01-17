'use client';

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

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
  const hasActions = headerGroups.some(headerGroup => headerGroup.headers.some(header => header.id === 'actions'));

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-md">
      <Table>
        <TableHeader className="sticky top-0 z-10 border-b border-white/10 bg-black/80/80 backdrop-blur">
          {headerGroups.map(headerGroup => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header, index) => {
                return (
                  <TableHead
                    key={header.id}
                    className={classNames(
                      'whitespace-nowrap bg-black/80 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400',
                      {
                        'sticky right-0 bg-black': index === headerGroup.headers.length - 1 && hasActions,
                      },
                    )}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                className={classNames('h-24 w-full bg-black/40 text-center', {
                  'sticky right-0': hasActions,
                })}>
                <div className="flex h-full items-center justify-center">
                  <LoaderIcon className="h-8 w-8 animate-spin text-zinc-300" />
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="border-b border-white/5 last:border-b-0 hover:bg-white/5">
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className="text-sm text-zinc-100">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 bg-black/40 text-center text-sm text-zinc-400">
                Не знайдено результатів
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {!isLoading && data.length > 0 && (
          <TableFooter>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="bg-black/70 text-xs text-zinc-300">
                <div className="flex items-center justify-between">
                  {total > 0 && data.length > 0 && (
                    <div>
                      Показано: {data.length} з {total}
                    </div>
                  )}

                  {total !== data.length && onLoadMore && (
                    <Button className="ml-4" variant="outline" size="sm" onClick={onLoadMore}>
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
