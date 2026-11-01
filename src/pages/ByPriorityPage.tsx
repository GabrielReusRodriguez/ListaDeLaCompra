import { useParams } from 'react-router-dom';
import { useShopping } from '../context/ShoppingContext';
import { useTranslation } from '../hooks';
import { ItemRow, Header } from '../components';
import { Priority } from '../types';

export function ByPriorityPage() {
  const { t } = useTranslation();
  const { items } = useShopping();
  useParams<{ lang: string }>();

  const priorityOrder: Priority[] = ['alta', 'media', 'baja'];

  const groupedItems = priorityOrder.map(priority => ({
    priority,
    items: items
      .filter(item => item.priority === priority)
      .sort((a, b) => a.createdAt - b.createdAt),
  }));

  return (
    <div className="page">
      <Header />
      
      <main className="main-content">
        <div className="page-header">
          <h1>{t('byPriority')}</h1>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <p>{t('noItems')}</p>
          </div>
        ) : (
          <div className="grouped-items">
            {groupedItems.map(({ priority, items: priorityItems }) => (
              <div key={priority} className="item-group">
                <h2 className="group-title">
                  {priority === 'alta' && t('priorityHigh')}
                  {priority === 'media' && t('priorityMedium')}
                  {priority === 'baja' && t('priorityLow')}
                </h2>
                {priorityItems.length > 0 ? (
                  priorityItems.map((item) => (
                    <ItemRow key={item.id} item={item} />
                  ))
                ) : (
                  <p className="group-empty">No hay artículos con prioridad {priority}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ByPriorityPage;
