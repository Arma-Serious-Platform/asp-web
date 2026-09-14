import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { EditIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { NewsModel } from '@/entities/news';
import { Button } from '@/shared/ui/atoms/button';
import { Popover } from '@/shared/ui/moleculas/popover';
import { newsPageState } from './state/news-page.state';
import { UserNicknameText } from '@/entities/user/ui/user-text';

export const columns: ColumnDef<NewsModel>[] = [
  {
    accessorKey: 'image',
    header: () => <div>Зображення</div>,
    cell: ({ row }) => {
      const url = row.original.data.image?.url;
      return (
        <div className="flex size-12 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-black/60">
          {url ? (
            <Image
              src={url}
              alt={row.original.title}
              width={48}
              height={48}
              className="size-12 object-cover"
              unoptimized={!url.startsWith('https')}
            />
          ) : (
            <span className="text-[10px] text-zinc-500">—</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'title',
    header: () => <div>Заголовок</div>,
    cell: ({ row }) => <div className="max-w-xs truncate font-medium text-zinc-100">{row.original.title}</div>,
  },
  {
    accessorKey: 'type',
    header: () => <div>Тип</div>,
    cell: ({ row }) => <div className="text-sm text-zinc-300">{row.original.typeLabel}</div>,
  },
  {
    accessorKey: 'published',
    header: () => <div>Статус</div>,
    cell: ({ row }) => (
      <div className={row.original.data.published ? 'text-green-400' : 'text-zinc-500'}>
        {row.original.data.published ? 'Опубліковано' : 'Чернетка'}
      </div>
    ),
  },
  {
    accessorKey: 'date',
    header: () => <div>Дата</div>,
    cell: ({ row }) => (
      <div className="text-sm text-zinc-400">{dayjs(row.original.data.date).format('DD.MM.YYYY')}</div>
    ),
  },
  {
    accessorKey: 'author',
    header: () => <div>Автор</div>,
    cell: ({ row }) =>
      row.original.data.author ? (
        <UserNicknameText user={row.original.data.author} link={false} className="text-sm" />
      ) : (
        <span className="text-zinc-500">—</span>
      ),
  },
  {
    id: 'actions',
    header: () => <div>Дії</div>,
    cell: observer(({ row }) => (
      <Popover
        className="flex w-fit flex-col gap-2"
        trigger={
          <Button size="icon" variant="secondary">
            <MoreHorizontalIcon className="size-4" />
          </Button>
        }>
        <Button
          size="sm"
          variant="secondary"
          align="left"
          onClick={() =>
            newsPageState.manageNews.modal.open({
              news: row.original.data,
              mode: 'manage',
            })
          }>
          <EditIcon className="size-4 text-yellow-500" />
          Редагувати
        </Button>
        <Button
          size="sm"
          variant="secondary"
          align="left"
          onClick={() =>
            newsPageState.manageNews.modal.open({
              news: row.original.data,
              mode: 'delete',
            })
          }>
          <TrashIcon className="size-4 text-red-500" />
          Видалити
        </Button>
      </Popover>
    )),
  },
];
