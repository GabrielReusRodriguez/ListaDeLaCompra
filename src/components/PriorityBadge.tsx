import { useTranslation } from '../hooks/useTranslation';
import type { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { t } = useTranslation();
  return (
    <span className={`badge badge--priority-${priority}`}>
      <span className="badge__dot" aria-hidden="true" />
      {t.priority[priority]}
    </span>
  );
}
