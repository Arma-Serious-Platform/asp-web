'use client';

import { observer } from 'mobx-react-lite';
import { Button } from '@/shared/ui/atoms/button';
import { DateInput } from '@/shared/ui/atoms/input';
import { Select } from '@/shared/ui/atoms/select';
import { NEWS_TYPE_LABELS } from '@/entities/news';
import { NewsType } from '@/shared/sdk/news/news.schemas';
import { mapUsersToSelectOptions } from '@/entities/user/ui/user-select-options';
import { newsPageState } from '../state/news-page.state';

export type NewsFiltersState = {
  authorId: string | null;
  type: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  published: string | null;
};

type NewsFiltersProps = {
  filters: NewsFiltersState;
  setFilters: (patch: Partial<NewsFiltersState>) => void;
  onReset: () => void;
  isFilterApplied: boolean;
};

const typeOptions = Object.values(NewsType).map(value => ({
  label: NEWS_TYPE_LABELS[value],
  value,
}));

const publishedOptions = [
  { label: 'Опубліковані', value: 'true' },
  { label: 'Чернетки', value: 'false' },
];

const filterControlClassName = 'min-w-[8.5rem] flex-1 basis-[8.5rem]';

export const NewsFilters = observer(({ filters, setFilters, onReset, isFilterApplied }: NewsFiltersProps) => {
  const authorOptions = mapUsersToSelectOptions(newsPageState.manageNews.authors);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className={filterControlClassName}>
        <Select
          placeholder="Автор"
          localSearch
          options={authorOptions}
          value={filters.authorId ?? ''}
          onChange={value => setFilters({ authorId: value || null })}
        />
      </div>
      <div className={filterControlClassName}>
        <Select
          placeholder="Тип"
          options={typeOptions}
          value={filters.type ?? ''}
          onChange={value => setFilters({ type: value || null })}
        />
      </div>
      <div className={filterControlClassName}>
        <Select
          placeholder="Статус"
          options={publishedOptions}
          value={filters.published ?? ''}
          onChange={value => setFilters({ published: value || null })}
        />
      </div>
      <div className={filterControlClassName}>
        <DateInput
          placeholder="Від"
          mode="date"
          value={filters.dateFrom ?? ''}
          onChange={e => setFilters({ dateFrom: e.target.value || null })}
        />
      </div>
      <div className={filterControlClassName}>
        <DateInput
          placeholder="До"
          mode="date"
          value={filters.dateTo ?? ''}
          onChange={e => setFilters({ dateTo: e.target.value || null })}
        />
      </div>
      {isFilterApplied && (
        <Button size="sm" variant="ghost" onClick={onReset}>
          Скинути
        </Button>
      )}
    </div>
  );
});
