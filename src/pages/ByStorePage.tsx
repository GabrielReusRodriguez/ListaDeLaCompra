import { useParams } from 'react-router-dom';
import { useShopping } from '../context/ShoppingContext';
import { useTranslation } from '../hooks';
import { ItemRow, Header, StoreBadge } from '../components';
import { Store } from '../types';

export function ByStorePage() {
  const { t } = useTranslation();
  const { items } = useShopping();
  useParams<{ lang: string }>();

  const predefinedStores: Store[] = ['supermercado', 'panaderia', 'fruteria', 'carniceria', 'centro comercial', 'otros'];

  const getStoreName = (store: Store | string) => {
    if (predefinedStores.includes(store as Store)) {
      return store;
    }
    return store;
  };

  const groupedItems = items.reduce((acc, item) => {
    const store = getStoreName(item.store);
    if (!acc[store]) {
      acc[store] = [];
    }
    acc[store].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const sortedStores = Object.keys(groupedItems).sort((a, b) => {
    const aIndex = predefinedStores.indexOf(a as Store);
    const bIndex = predefinedStores.indexOf(b as Store);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div className="page">
      <Header />
      
      <main className="main-content">
        <div className="page-header">
          <h1>{t('byStore')}</h1>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <p>{t('noItems')}</p>
          </div>
        ) : (
          <div className="grouped-items">
            {sortedStores.map((store) => (
              <div key={store} className="item-group">
                <h2 className="group-title">
                  <StoreBadge store={store as Store} />
                </h2>
                {groupedItems[store]
                  .sort((a, b) => {
                    const priorityOrder = { alta: 0, media: 1, baja: 2 };
                    const priorityA = priorityOrder[a.priority];
                    const priorityB = priorityOrder[b.priority];
                    if (priorityA !== priorityB) return priorityA - priorityB;
                    return a.createdAt - b.createdAt;
                  })
                  .map((item) => (
                    <ItemRow key={item.id} item={item} />
                  ))}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ByStorePage;
