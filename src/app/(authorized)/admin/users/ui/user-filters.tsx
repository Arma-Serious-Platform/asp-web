'use client';

import { observer } from 'mobx-react-lite';
import { Button } from '@/shared/ui/atoms/button';
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { UserModel } from '@/entities/user/user.model';
import { UserRole, UserStatus } from '@/shared/sdk/types';

export type UserFiltersState = {
  roles: string[] | null;
  status: string | null;
  warningCount: string | null;
};

type UserFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  filters: UserFiltersState;
  setFilters: (patch: Partial<UserFiltersState>) => void;
  onReset: () => void;
  isFilterApplied: boolean;
};

const filterControlClassName = 'min-w-[8.5rem] flex-1 basis-[8.5rem]';

const roleOptions = Object.values(UserRole).map(role => ({
  value: role,
  label: UserModel.roleLabels[role],
}));

const statusOptions = Object.values(UserStatus)
  .filter(status => status !== UserStatus.INVITED)
  .map(status => ({
    value: status,
    label: UserModel.getStatusText(status),
  }));

export const UserFilters = observer(
  ({ search, onSearchChange, filters, setFilters, onReset, isFilterApplied }: UserFiltersProps) => {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="min-w-[12rem] flex-1 basis-[12rem]">
          <Input
            searchIcon
            placeholder="Пошук..."
            autoFocus
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
        <div className={filterControlClassName}>
          <Select
            placeholder="Ролі"
            localSearch
            multiple
            options={roleOptions}
            value={filters.roles ?? []}
            onChange={value => setFilters({ roles: value.length ? value : null })}
          />
        </div>
        <div className={filterControlClassName}>
          <Select
            placeholder="Статус"
            options={statusOptions}
            value={filters.status ?? ''}
            onChange={value => setFilters({ status: value || null })}
          />
        </div>
        <div className={filterControlClassName}>
          <NumericInput
            placeholder="К-сть попереджень"
            min={0}
            value={filters.warningCount ?? ''}
            onChange={e => setFilters({ warningCount: e.target.value || null })}
          />
        </div>
        {isFilterApplied && (
          <Button size="sm" variant="ghost" onClick={onReset} className="shrink-0">
            Скинути
          </Button>
        )}
      </div>
    );
  },
);
