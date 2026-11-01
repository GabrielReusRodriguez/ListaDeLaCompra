import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useShopping } from '../context/ShoppingContext';
import { useTranslation } from '../hooks';
import { ListCard, Modal } from '../components';
import { Header } from '../components';

export function ListsPage() {
  const { t } = useTranslation();
  const { lists, setActiveList } = useShopping();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewList = (listId: string) => {
    setActiveList(listId);
    navigate(`/${lang}/lista/${listId}`);
  };



  return (
    <div className="page">
      <Header />
      
      <main className="main-content">
        <div className="page-header">
          <h1>{t('lists')}</h1>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            {t('newList')}
          </button>
        </div>

        {lists.length === 0 ? (
          <div className="empty-state">
            <p>{t('noLists')}</p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              {t('newList')}
            </button>
          </div>
        ) : (
          <div className="lists-grid">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onSelect={() => handleViewList(list.id)}
              />
            ))}
          </div>
        )}

        <div className="view-links">
          <h2>{t('allLists')}</h2>
          <div className="view-options">
            <button onClick={() => navigate(`/${lang}/por-prioridad`)} className="btn btn-secondary">
              {t('byPriority')}
            </button>
            <button onClick={() => navigate(`/${lang}/por-lugar`)} className="btn btn-secondary">
              {t('byStore')}
            </button>
          </div>
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div>List Form Modal</div>
      </Modal>
    </div>
  );
}

export default ListsPage;
