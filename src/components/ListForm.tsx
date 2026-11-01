import { useState } from 'react';
import { ShoppingList } from '../types';
import { useTranslation } from '../hooks';
import { useShopping } from '../context/ShoppingContext';

interface ListFormProps {
  list?: ShoppingList;
  onClose: () => void;
}

export function ListForm({ list, onClose }: ListFormProps) {
  const { t } = useTranslation();
  const { addList, updateList } = useShopping();

  const [name, setName] = useState(list?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert(t('listName') + ' ' + t('passwordRequired'));
      return;
    }

    if (list) {
      updateList(list.id, name.trim());
    } else {
      addList(name.trim());
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="list-form">
      <h2>{list ? t('edit') : t('newList')}</h2>
      
      <div className="form-group">
        <label htmlFor="name">{t('listName')}</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
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

export default ListForm;
