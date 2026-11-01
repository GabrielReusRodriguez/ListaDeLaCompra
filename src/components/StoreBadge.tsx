import { useTranslation } from '../hooks/useTranslation';
import { isCatalogStore } from '../types';

interface StoreBadgeProps {
  store: string;
}

export function StoreBadge({ store }: StoreBadgeProps) {
  const { t } = useTranslation();
  const key = store || 'otros';
  // Los lugares predefinidos se traducen; los personalizados se muestran tal cual.
  const label = isCatalogStore(key) ? t.store[key] : key;
  return <span className="badge badge--store">{label}</span>;
}
