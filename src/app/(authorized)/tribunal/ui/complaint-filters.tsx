'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Select, SelectOption } from '@/shared/ui/atoms/select';
import { cn } from '@/shared/utils/cn';

export type ComplaintFiltersState = {
  status: 'OPEN' | 'IN_PROGRESS' | 'PUNISHED' | 'REJECTED' | null;
  authorId: string | null;
  targetUserId: string | null;
  assigneeId: string | null;
};

const statusOptions: SelectOption[] = [
  { value: 'OPEN', label: 'Нова' },
  { value: 'IN_PROGRESS', label: 'В роботі' },
  { value: 'PUNISHED', label: 'Закрита · покарання' },
  { value: 'REJECTED', label: 'Закрита · відхилено' },
];

const toUserOptions = (users: { id: string; nickname: string }[]): SelectOption[] =>
  users.map(user => ({ value: user.id, label: user.nickname }));

type ComplaintFiltersProps = {
  filters: ComplaintFiltersState;
  authors: { id: string; nickname: string }[];
  targets: { id: string; nickname: string }[];
  assignees: { id: string; nickname: string }[];
  isFilterApplied: boolean;
  onChange: (patch: Partial<ComplaintFiltersState>) => void;
  onApply: () => void;
  onReset: () => void;
  className?: string;
};

export const ComplaintFilters = ({
  filters,
  authors,
  targets,
  assignees,
  isFilterApplied,
  onChange,
  onApply,
  onReset,
  className,
}: ComplaintFiltersProps) => {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Select
        label="Статус"
        placeholder="Усі статуси"
        options={statusOptions}
        value={filters.status || ''}
        onChange={value =>
          onChange({
            status: (value || null) as ComplaintFiltersState['status'],
          })
        }
      />
      <Select
        label="Заявник"
        placeholder="Усі заявники"
        localSearch
        options={toUserOptions(authors)}
        value={filters.authorId || ''}
        onChange={value => onChange({ authorId: value || null })}
      />
      <Select
        label="Обвинувачений"
        placeholder="Усі обвинувачені"
        localSearch
        options={toUserOptions(targets)}
        value={filters.targetUserId || ''}
        onChange={value => onChange({ targetUserId: value || null })}
      />
      <Select
        label="Адміністратор"
        placeholder="Усі адміністратори"
        localSearch
        options={toUserOptions(assignees)}
        value={filters.assigneeId || ''}
        onChange={value => onChange({ assigneeId: value || null })}
      />
      <div className="grid grid-cols-2 gap-2 pt-1 sm:flex sm:flex-col sm:gap-2 sm:pt-2">
        <Button variant="outline" onClick={onApply} className="w-full">
          Застосувати
        </Button>
        <Button variant={isFilterApplied ? 'secondary' : 'ghost'} disabled={!isFilterApplied} onClick={onReset} className="w-full">
          Скинути
        </Button>
      </div>
    </div>
  );
};
