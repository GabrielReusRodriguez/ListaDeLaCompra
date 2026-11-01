import { useId, useState, type FormEvent } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import {
  DEFAULT_PRIORITY,
  PRIORITIES,
  STORE_CATALOG,
  isCatalogStore,
  type Item,
  type ItemInput,
  type Priority,
  type ShoppingList,
} from '../types';

interface ItemFormProps {
  lists: ShoppingList[];
  /** Lista preseleccionada; si falta, se usa la primera. */
  defaultListId?: string;
  item?: Item;
  onSubmit: (input: ItemInput) => void;
  onCancel: () => void;
}

const CUSTOM_STORE = '__custom__';

export function ItemForm({ lists, defaultListId, item, onSubmit, onCancel }: ItemFormProps) {
  const { t } = useTranslation();
  const formId = useId();

  const initialStore = item?.store ?? STORE_CATALOG[0];
  const [name, setName] = useState(item?.name ?? '');
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1));
  const [unit, setUnit] = useState(item?.unit ?? '');
  const [listId, setListId] = useState(item?.listId ?? defaultListId ?? lists[0]?.id ?? '');
  const [priority, setPriority] = useState<Priority>(item?.priority ?? DEFAULT_PRIORITY);
  const [storeChoice, setStoreChoice] = useState(
    isCatalogStore(initialStore) ? initialStore : CUSTOM_STORE,
  );
  const [customStore, setCustomStore] = useState(isCatalogStore(initialStore) ? '' : initialStore);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedQuantity = Number(quantity.replace(',', '.'));
    const store = storeChoice === CUSTOM_STORE ? customStore.trim() : storeChoice;

    if (!name.trim()) {
      setError(t.item.invalidName);
      return;
    }
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError(t.item.invalidQuantity);
      return;
    }
    if (!store) {
      setError(t.item.invalidStore);
      return;
    }
    if (!listId) {
      setError(t.item.invalidList);
      return;
    }

    setError(null);
    onSubmit({ listId, name, quantity: parsedQuantity, unit, store, priority });
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}

      <div className="field">
        <label htmlFor={`${formId}-name`}>{t.item.name}</label>
        <input
          id={`${formId}-name`}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="off"
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor={`${formId}-quantity`}>{t.item.quantity}</label>
          <input
            id={`${formId}-quantity`}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor={`${formId}-unit`}>{t.item.unit}</label>
          <input
            id={`${formId}-unit`}
            type="text"
            value={unit}
            placeholder={t.item.unitPlaceholder}
            onChange={(event) => setUnit(event.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${formId}-list`}>{t.item.list}</label>
        <select
          id={`${formId}-list`}
          value={listId}
          onChange={(event) => setListId(event.target.value)}
          required
        >
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor={`${formId}-store`}>{t.item.store}</label>
        <select
          id={`${formId}-store`}
          value={storeChoice}
          onChange={(event) => setStoreChoice(event.target.value)}
        >
          {STORE_CATALOG.map((store) => (
            <option key={store} value={store}>
              {t.store[store]}
            </option>
          ))}
          <option value={CUSTOM_STORE}>{t.item.storeCustom}</option>
        </select>
      </div>

      {storeChoice === CUSTOM_STORE && (
        <div className="field">
          <label htmlFor={`${formId}-custom-store`}>{t.item.storeCustom}</label>
          <input
            id={`${formId}-custom-store`}
            type="text"
            value={customStore}
            placeholder={t.item.storeCustomPlaceholder}
            onChange={(event) => setCustomStore(event.target.value)}
            autoComplete="off"
          />
        </div>
      )}

      <fieldset className="field field--radio">
        <legend>{t.item.priority}</legend>
        <div className="radio-group">
          {PRIORITIES.map((option) => (
            <label key={option} className={`radio radio--${option}`}>
              <input
                type="radio"
                name={`${formId}-priority`}
                value={option}
                checked={priority === option}
                onChange={() => setPriority(option)}
              />
              <span>{t.priority[option]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          {t.common.cancel}
        </button>
        <button type="submit" className="btn btn--primary">
          {t.common.save}
        </button>
      </div>
    </form>
  );
}
