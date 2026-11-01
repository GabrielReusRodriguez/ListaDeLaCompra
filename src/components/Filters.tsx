import { useId } from 'react';
import { interpolate, useTranslation } from '../hooks/useTranslation';
import { PRIORITIES, isCatalogStore, type Filters as FiltersState, type Priority } from '../types';

interface FiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  lists: { id: string; name: string }[];
  stores: string[];
  /** La vista por prioridad oculta el filtro de prioridad y viceversa. */
  showPriority?: boolean;
  showStore?: boolean;
  showList?: boolean;
  resultCount: number;
}

export function Filters({
  filters,
  onChange,
  lists,
  stores,
  showPriority = true,
  showStore = true,
  showList = true,
  resultCount,
}: FiltersProps) {
  const { t } = useTranslation();
  const id = useId();
  const update = (patch: Partial<FiltersState>) => onChange({ ...filters, ...patch });
  const isDirty =
    filters.search !== '' ||
    filters.listId !== 'all' ||
    filters.priority !== 'all' ||
    filters.store !== 'all';

  const countLabel =
    resultCount === 0
      ? t.filters.resultCountZero
      : resultCount === 1
        ? t.filters.resultCountOne
        : interpolate(t.filters.resultCount, { count: resultCount });

  const fieldCount = 1 + Number(showList) + Number(showPriority) + Number(showStore);

  return (
    <section className="filters" aria-label={t.filters.legend}>
      <div className="filters__grid" data-fields={fieldCount}>
        <div className="field">
          <label htmlFor={`${id}-search`}>{t.filters.search}</label>
          <input
            id={`${id}-search`}
            type="search"
            value={filters.search}
            placeholder={t.filters.searchPlaceholder}
            onChange={(event) => update({ search: event.target.value })}
          />
        </div>

        {showList && (
          <div className="field">
            <label htmlFor={`${id}-list`}>{t.filters.list}</label>
            <select
              id={`${id}-list`}
              value={filters.listId}
              onChange={(event) => update({ listId: event.target.value })}
            >
              <option value="all">{t.filters.allLists}</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showPriority && (
          <div className="field">
            <label htmlFor={`${id}-priority`}>{t.filters.priority}</label>
            <select
              id={`${id}-priority`}
              value={filters.priority}
              onChange={(event) => update({ priority: event.target.value as Priority | 'all' })}
            >
              <option value="all">{t.filters.allPriorities}</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {t.priority[priority]}
                </option>
              ))}
            </select>
          </div>
        )}

        {showStore && (
          <div className="field">
            <label htmlFor={`${id}-store`}>{t.filters.store}</label>
            <select
              id={`${id}-store`}
              value={filters.store}
              onChange={(event) => update({ store: event.target.value })}
            >
              <option value="all">{t.filters.allStores}</option>
              {stores.map((store) => (
                <option key={store} value={store}>
                  {isCatalogStore(store) ? t.store[store] : store}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="filters__footer">
        <p className="filters__count" role="status">
          {countLabel}
        </p>
        {isDirty && (
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => onChange({ search: '', listId: 'all', priority: 'all', store: 'all' })}
          >
            {t.filters.clear}
          </button>
        )}
      </div>
    </section>
  );
}
