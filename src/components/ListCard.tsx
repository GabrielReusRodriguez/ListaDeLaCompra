import { interpolate, useTranslation } from '../hooks/useTranslation';
import type { ShoppingList } from '../types';

interface ListCardProps {
  list: ShoppingList;
  pendingCount: number;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function ListCard({ list, pendingCount, onOpen, onRename, onDelete }: ListCardProps) {
  const { t } = useTranslation();
  const countLabel =
    pendingCount === 0
      ? t.lists.itemCountZero
      : pendingCount === 1
        ? t.lists.itemCountOne
        : interpolate(t.lists.itemCount, { count: pendingCount });

  return (
    <article className="card list-card">
      <button type="button" className="list-card__main" onClick={onOpen}>
        <span className="list-card__name">{list.name}</span>
        <span className="list-card__count">{countLabel}</span>
      </button>
      <div className="list-card__actions">
        <button type="button" className="btn btn--ghost btn--small" onClick={onRename}>
          {t.common.edit}
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--small btn--danger-text"
          onClick={onDelete}
        >
          {t.common.delete}
        </button>
      </div>
    </article>
  );
}
