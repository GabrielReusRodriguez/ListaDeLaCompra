import { useMemo, useState } from 'react';
import { ConfirmDialog, Filters, ItemForm, ItemRow, Modal } from '../components';
import { Header } from '../components/Header';
import { useShopping } from '../context/ShoppingContext';
import { interpolate, useTranslation } from '../hooks/useTranslation';
import { collectStores, filterItems, groupByPriority } from '../lib/shopping';
import {
  createEmptyFilters,
  type Filters as FiltersState,
  type Item,
  type ItemInput,
} from '../types';

/** Pendientes de todas las listas ordenados alta → media → baja. */
export function ByPriorityPage() {
  const { t } = useTranslation();
  const { lists, items, loading, updateItem, deleteItem, markAsPurchased } = useShopping();

  const [filters, setFilters] = useState<FiltersState>(createEmptyFilters);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);

  const stores = useMemo(() => collectStores(items), [items]);
  const visible = useMemo(() => filterItems(items, filters), [items, filters]);
  const groups = useMemo(() => groupByPriority(visible), [visible]);
  const listNames = useMemo(() => new Map(lists.map((list) => [list.id, list.name])), [lists]);

  const handleSubmit = (input: ItemInput) => {
    if (editing) updateItem(editing.id, input);
    setEditing(null);
  };

  return (
    <div className="layout">
      <Header />
      <main className="main" id="main-content">
        <div className="page-header">
          <h1>{t.byPriority.title}</h1>
        </div>

        <Filters
          filters={filters}
          onChange={setFilters}
          lists={lists}
          stores={stores}
          showPriority={false}
          resultCount={visible.length}
        />

        {loading ? (
          <p className="empty-state" role="status">
            {t.common.loading}
          </p>
        ) : items.length === 0 ? (
          <p className="empty-state">{t.byPriority.empty}</p>
        ) : visible.length === 0 ? (
          <p className="empty-state">{t.byPriority.emptyFiltered}</p>
        ) : (
          groups.map((group) => (
            <section
              key={group.priority}
              className="group"
              aria-labelledby={`priority-${group.priority}`}
            >
              <h2 id={`priority-${group.priority}`} className="group__title">
                {t.priority[group.priority]}
                <span className="group__count">{group.items.length}</span>
              </h2>
              <ul className="item-list">
                {group.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    listName={listNames.get(item.listId)}
                    onEdit={() => setEditing(item)}
                    onDelete={() => setDeleting(item)}
                    onMarkPurchased={() => markAsPurchased(item.id)}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </main>

      {editing && (
        <Modal title={t.item.editItem} onClose={() => setEditing(null)}>
          <ItemForm
            lists={lists}
            item={editing}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title={t.item.deleteTitle}
          message={interpolate(t.item.deleteConfirm, { name: deleting.name })}
          onConfirm={() => {
            deleteItem(deleting.id);
            setDeleting(null);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
