import { Store } from '../types';
import { useTranslation } from '../hooks';

interface StoreBadgeProps {
  store: Store | string;
}

export function StoreBadge({ store }: StoreBadgeProps) {
  const { t } = useTranslation();

  const getStoreText = () => {
    switch (store) {
      case 'supermercado':
        return t('storeSupermarket');
      case 'panaderia':
        return t('storeBakery');
      case 'fruteria':
        return t('storeGreengrocer');
      case 'carniceria':
        return t('storeButcher');
      case 'centro comercial':
        return t('storeMall');
      case 'otros':
        return t('storeOthers');
      default:
        return store;
    }
  };

  return <span className="store-badge">{getStoreText()}</span>;
}

export default StoreBadge;
