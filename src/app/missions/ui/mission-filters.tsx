'use client';

import { observer } from 'mobx-react-lite';
import { Button } from '@/shared/ui/atoms/button';
import { Input, NumericInput } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { MissionStatus, MissionType, MissionObjective, State } from '@/shared/sdk/types';
import { cn } from '@/shared/utils/cn';
import { mapUsersToSelectOptions } from '@/entities/user/ui/user-select-options';
import { missionsState } from '../state/missions-page.state';
import { MissionModel } from '@/entities/mission/mission.model';

export type MissionFiltersState = {
  search: string | null;
  status: MissionStatus | null;
  state: State | null;
  islandId: string | null;
  authorId: string | null;
  reviewerId: string | null;
  minSlots: number | null;
  maxSlots: number | null;
  minSlotsToPlay: number | null;
  missionType: MissionType | null;
  missionObjective: MissionObjective | null;
  orderType: 'asc' | 'desc';
};

type MissionFiltersProps = {
  filters: MissionFiltersState;
  setFilters: (patch: Partial<MissionFiltersState>) => void;
  isFilterApplied: boolean;
  onApply: () => void;
  onReset: () => void;
  className?: string;
};

export const MissionFilters = observer(
  ({ filters, setFilters, isFilterApplied, onApply, onReset, className }: MissionFiltersProps) => {
    const isLoading = missionsState.missionsPagination.loader.isLoading;

    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <Input
          label="Пошук"
          placeholder="По назві"
          value={filters.search || ''}
          onChange={e => setFilters({ search: e.target.value || null })}
          searchIcon
        />

        <Select
          label="Тип місії"
          options={MissionModel.missionTypeOptions}
          value={filters.missionType || ''}
          onChange={value =>
            setFilters({
              missionType: value ? (value as MissionType) : null,
            })
          }
        />

        <Select
          label="Тип бою"
          options={MissionModel.missionObjectiveOptions}
          value={filters.missionObjective || ''}
          onChange={value =>
            setFilters({
              missionObjective: value ? (value as MissionObjective) : null,
            })
          }
        />

        <Select
          label="Статус останньої версії"
          options={MissionModel.statusOptions}
          value={filters.status || ''}
          onChange={value =>
            setFilters({
              status: value ? (value as MissionStatus) : null,
            })
          }
        />

        <Select
          label="Стан"
          options={MissionModel.stateOptions}
          value={filters.state || ''}
          onChange={value =>
            setFilters({
              state: value ? (value as State) : null,
            })
          }
        />

        <Select
          label="Автор"
          options={mapUsersToSelectOptions(missionsState.authorsPagination.data)}
          localSearch
          placeholder="Усі автори"
          value={filters.authorId || ''}
          onChange={value => setFilters({ authorId: value || null })}
        />

        <Select
          label="Перевіряючий"
          options={mapUsersToSelectOptions(missionsState.reviewersPagination.data)}
          localSearch
          placeholder="Усі перевіряючі"
          value={filters.reviewerId || ''}
          onChange={value => setFilters({ reviewerId: value || null })}
        />

        <Select
          label="Карта"
          resultsClassName="max-h-[150px] overflow-y-auto"
          multiple={false}
          placeholder="Усі карти"
          options={missionsState.islandsOptions}
          value={filters.islandId || ''}
          localSearch
          onChange={value => setFilters({ islandId: value || null })}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
          <NumericInput
            label="Мін. слотів"
            placeholder="0"
            value={filters.minSlots?.toString() || ''}
            onChange={e =>
              setFilters({
                minSlots: e.target.value ? parseInt(e.target.value, 10) : null,
              })
            }
          />

          <NumericInput
            label="Макс. слотів"
            placeholder="0"
            value={filters.maxSlots?.toString() || ''}
            onChange={e =>
              setFilters({
                maxSlots: e.target.value ? parseInt(e.target.value, 10) : null,
              })
            }
          />
        </div>

        <NumericInput
          label="Мінімальні слоти для гри mVTG"
          placeholder="0"
          value={filters.minSlotsToPlay?.toString() || ''}
          onChange={e =>
            setFilters({
              minSlotsToPlay: e.target.value ? parseInt(e.target.value, 10) : null,
            })
          }
        />

        <div className="grid grid-cols-2 gap-2 pt-1 sm:flex sm:flex-col sm:gap-2 sm:pt-2">
          <Button variant="outline" disabled={isLoading} onClick={onApply} className="w-full">
            Застосувати
          </Button>

          <Button variant="ghost" disabled={isLoading || !isFilterApplied} onClick={onReset} className="w-full">
            Скинути
          </Button>
        </div>
      </div>
    );
  },
);
