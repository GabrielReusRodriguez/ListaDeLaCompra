import { useState } from 'react';
import { Item, Priority, Store } from '../types';
import { useTranslation } from '../hooks';
import { useShopping } from '../context/ShoppingContext';

interface ItemFormProps {
  item?: Item;
  listId: string;
  onClose: () => void;
}

export function ItemForm({ item, listId, onClose }: ItemFormProps) {
  const { t } = useTranslation();
  const { addItem, updateItem } = useShopping();

  const [name, setName] = useState(item?.name || '');
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [unit, setUnit] = useState(item?.unit || '');
  const [store, setStore] = useState<Store | string>(item?.store || 'supermercado');
  const [priority, setPriority] = useState<Priority>(item?.priority || 'media');

  const stores: Store[] = ['supermercado', 'panaderia', 'fruteria', 'carniceria', 'centro comercial', 'otros'];
  const priorities: Priority[] = ['alta', 'media', 'baja'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert(t('itemName') + ' ' + t('passwordRequired'));
      return;
    }

    const newItem = {
      listId,
      name: name.trim(),
      quantity,
      unit: unit.trim() || undefined,
      store,
      priority,
    };

    if (item) {
      updateItem({ ...item, ...newItem, id: item.id });
    } else {
      addItem(newItem);
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="item-form">
      <h2>{item ? t('edit') : t('newItem')}</h2>
      
      <div className="form-group">
        <label htmlFor="name">{t('itemName')}</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="quantity">{t('quantity')}</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
            min="1"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label htmlFor="unit">{t('unit')}</label>
          <input
            type="text"
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder={t('unit')}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="store">{t('store')}</label>
        <select
          id="store"
          value={store}
          onChange={(e) => setStore(e.target.value as Store | string)}
        >
          {stores.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value="custom">{t('storeOthers')}</option>
        </select>
        {store === 'custom' && (
          <input
            type="text"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder={t('storeOthers')}
            className="custom-store-input"
          />
        )}
      </div>

      <div className="form-group">
        <label htmlFor="priority">{t('priority')}</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        >
          {priorities.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onClose} className="btn btn-cancel">
          {t('cancel')}
        </button>
        <button type="submit" className="btn btn-primary">
          {t('save')}
        </button>
      </div>
    </form>
  );
}

export default ItemForm;
