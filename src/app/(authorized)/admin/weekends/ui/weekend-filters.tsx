'use client';

import { observer } from 'mobx-react-lite';
import { Button } from '@/shared/ui/atoms/button';
import { DateInput } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { mapUsersToSelectOptions } from '@/entities/user/ui/user-select-options';
import { UserModel } from '@/entities/user/user.model';
import { weekendsPageState } from '../state/weekends-page.state';

export type WeekendFiltersState = {
  missionIds: string[] | null;
  hqSquadId: string | null;
  adminId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  published: string | null;
};

type WeekendFiltersProps = {
  filters: WeekendFiltersState;
  setFilters: (patch: Partial<WeekendFiltersState>) => void;
  onReset: () => void;
  isFilterApplied: boolean;
};

const publishedOptions = [
  { label: 'Публіковані', value: 'true' },
  { label: 'Не публіковані', value: 'false' },
];

const filterControlClassName = 'min-w-[8.5rem] flex-1 basis-[8.5rem]';

export const WeekendFilters = observer(({ filters, setFilters, onReset, isFilterApplied }: WeekendFiltersProps) => {
  const { manageWeekend } = weekendsPageState;

  const missionOptions = manageWeekend.missions.options;
  const hqSquadOptions = manageWeekend.squads.pagination.data.map(squad => ({
    label: squad.data.tag,
    value: squad.id,
  }));
  const adminOptions = mapUsersToSelectOptions(
    manageWeekend.users.pagination.data.filter(user => UserModel.canAdminMission(user.data)),
  );

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className={filterControlClassName}>
        <Select
          placeholder="Місія"
          localSearch
          multiple
          options={missionOptions}
          value={filters.missionIds ?? []}
          onChange={value => setFilters({ missionIds: value.length ? value : null })}
        />
      </div>
      <div className={filterControlClassName}>
        <Select
          placeholder="Штаб"
          localSearch
          options={hqSquadOptions}
          value={filters.hqSquadId ?? ''}
          onChange={value => setFilters({ hqSquadId: value || null })}
        />
      </div>
      <div className={filterControlClassName}>
        <Select
          placeholder="Адміністратор"
          localSearch
          options={adminOptions}
          value={filters.adminId ?? ''}
          onChange={value => setFilters({ adminId: value || null })}
        />
      </div>
      <div className={filterControlClassName}>
        <DateInput
          placeholder="Дата від"
          mode="date"
          value={filters.dateFrom ?? ''}
          onChange={e => setFilters({ dateFrom: e.target.value || null })}
        />
      </div>
      <div className={filterControlClassName}>
        <DateInput
          placeholder="Дата до"
          mode="date"
          value={filters.dateTo ?? ''}
          onChange={e => setFilters({ dateTo: e.target.value || null })}
        />
      </div>
      <div className={filterControlClassName}>
        <Select
          placeholder="Публікація"
          options={publishedOptions}
          value={filters.published ?? ''}
          onChange={value => setFilters({ published: value || null })}
        />
      </div>
      {isFilterApplied && (
        <Button size="sm" variant="ghost" onClick={onReset} className="shrink-0">
          Скинути
        </Button>
      )}
    </div>
  );
});
