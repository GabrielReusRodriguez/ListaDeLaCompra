import React from 'react';
import { ShoppingList } from '../types';
import { useTranslation } from '../hooks';
import { useShopping } from '../context/ShoppingContext';

interface ListCardProps {
  list: ShoppingList;
  onSelect?: () => void;
}

export function ListCard({ list, onSelect }: ListCardProps) {
  const { t } = useTranslation();
  const { setActiveList, deleteList } = useShopping();

  const handleSelect = () => {
    setActiveList(list.id);
    if (onSelect) onSelect();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('delete') + ' ' + list.name + '?')) {
      deleteList(list.id);
    }
  };

  return (
    <div className="list-card" onClick={handleSelect}>
      <div className="list-card-content">
        <h3>{list.name}</h3>
        <p className="list-date">
          {new Date(list.createdAt).toLocaleDateString()}
        </p>
      </div>
      <button onClick={handleDelete} className="btn-icon btn-danger">
        ×
      </button>
    </div>
  );
}

export default ListCard;
