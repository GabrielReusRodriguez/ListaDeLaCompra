import { Priority } from '../types';
import { useTranslation } from '../hooks';

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { t } = useTranslation();

  const getPriorityClass = () => {
    switch (priority) {
      case 'alta':
        return 'priority-badge high';
      case 'media':
        return 'priority-badge medium';
      case 'baja':
        return 'priority-badge low';
      default:
        return 'priority-badge';
    }
  };

  const getPriorityText = () => {
    switch (priority) {
      case 'alta':
        return t('priorityHigh');
      case 'media':
        return t('priorityMedium');
      case 'baja':
        return t('priorityLow');
      default:
        return priority;
    }
  };

  return <span className={getPriorityClass()}>{getPriorityText()}</span>;
}

export default PriorityBadge;
