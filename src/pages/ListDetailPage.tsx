import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShopping } from '../context/ShoppingContext';
import { useTranslation } from '../hooks';
import { ItemRow, Modal, Header } from '../components';

export function ListDetailPage() {
  const { t } = useTranslation();
  const { lists, items, activeListId } = useShopping();
  const { id, lang } = useParams<{ id: string; lang: string }>();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeList = lists.find(l => l.id === (id || activeListId));

  useEffect(() => {
    if (id && !activeList) {
      navigate(`/${lang}/listas`);
    }
  }, [id, activeList, lang, navigate]);

  const listItems = items.filter(item => item.listId === (id || activeListId));

  const handleAddItem = () => {
    setIsModalOpen(true);
  };

  if (!activeList) {
    return (
      <div className="page">
        <Header />
        <main className="main-content">
          <p>Lista no encontrada</p>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Header />
      
      <main className="main-content">
        <div className="page-header">
          <h1>{activeList.name}</h1>
          <button onClick={handleAddItem} className="btn btn-primary">
            {t('newItem')}
          </button>
        </div>

        {listItems.length === 0 ? (
          <div className="empty-state">
            <p>{t('noItems')}</p>
            <button onClick={handleAddItem} className="btn btn-primary">
              {t('newItem')}
            </button>
          </div>
        ) : (
          <div className="items-list">
            {listItems
              .sort((a, b) => {
                const priorityOrder = { alta: 0, media: 1, baja: 2 };
                const priorityA = priorityOrder[a.priority];
                const priorityB = priorityOrder[b.priority];
                if (priorityA !== priorityB) return priorityA - priorityB;
                return a.createdAt - b.createdAt;
              })
              .map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                />
              ))}
          </div>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div>Item Form Modal</div>
      </Modal>
    </div>
  );
}

export default ListDetailPage;
