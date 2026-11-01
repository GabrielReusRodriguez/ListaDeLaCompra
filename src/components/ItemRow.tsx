import { Item } from '../types';
import PriorityBadge from './PriorityBadge';
import StoreBadge from './StoreBadge';
import { useTranslation } from '../hooks';
import { useShopping } from '../context/ShoppingContext';

interface ItemRowProps {
  item: Item;
  onEdit?: () => void;
}

export function ItemRow({ item, onEdit }: ItemRowProps) {
  const { t } = useTranslation();
  const { markAsPurchased, deleteItem } = useShopping();

  const handleMarkAsPurchased = () => {
    markAsPurchased(item.id);
  };

  const handleDelete = () => {
    if (window.confirm(t('delete') + ' ' + item.name + '?')) {
      deleteItem(item.id);
    }
  };

  return (
    <div className="item-row">
      <div className="item-info">
        <div className="item-header">
          <h3>{item.name}</h3>
          <div className="item-badges">
            <PriorityBadge priority={item.priority} />
            <StoreBadge store={item.store} />
          </div>
        </div>
        <div className="item-details">
          <span className="item-quantity">
            {item.quantity} {item.unit && item.unit}
          </span>
        </div>
      </div>
      <div className="item-actions">
        {onEdit && (
          <button onClick={onEdit} className="btn btn-edit">
            {t('edit')}
          </button>
        )}
        <button onClick={handleMarkAsPurchased} className="btn btn-success">
          {t('markAsPurchased')}
        </button>
        <button onClick={handleDelete} className="btn btn-danger">
          {t('delete')}
        </button>
      </div>
    </div>
  );
}

export default ItemRow;
