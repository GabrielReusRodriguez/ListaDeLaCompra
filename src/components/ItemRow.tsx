import { formatQuantity } from '../i18n';
import { interpolate, useTranslation } from '../hooks/useTranslation';
import type { Item } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { StoreBadge } from './StoreBadge';

interface ItemRowProps {
  item: Item;
  /** Nombre de la lista, solo en las vistas agregadas. */
  listName?: string;
  onEdit: () => void;
  onDelete: () => void;
  onMarkPurchased: () => void;
}

export function ItemRow({ item, listName, onEdit, onDelete, onMarkPurchased }: ItemRowProps) {
  const { t, locale } = useTranslation();
  const quantity = formatQuantity(locale, item.quantity);
  const quantityText = item.unit ? `${quantity} ${item.unit}` : quantity;

  return (
    <li className="item-row">
      <div className="item-row__info">
        <p className="item-row__name">{item.name}</p>
        <p className="item-row__meta">
          <span className="item-row__quantity">
            {interpolate(t.item.quantityLabel, { quantity: quantityText })}
          </span>
          <StoreBadge store={item.store} />
          <PriorityBadge priority={item.priority} />
          {listName && <span className="badge badge--list">{listName}</span>}
        </p>
      </div>
      <div className="item-row__actions">
        <button
          type="button"
          className="btn btn--success btn--small"
          onClick={onMarkPurchased}
          aria-label={`${t.item.markPurchased}: ${item.name}`}
        >
          <span aria-hidden="true">✓</span>
          <span className="btn__label">{t.item.purchased}</span>
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--small"
          onClick={onEdit}
          aria-label={`${t.common.edit}: ${item.name}`}
        >
          {t.common.edit}
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--small btn--danger-text"
          onClick={onDelete}
          aria-label={`${t.common.delete}: ${item.name}`}
        >
          {t.common.delete}
        </button>
      </div>
    </li>
  );
}
