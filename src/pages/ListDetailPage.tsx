import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ConfirmDialog, Filters, ItemForm, ItemRow, Modal } from '../components';
import { Header } from '../components/Header';
import { useShopping } from '../context/ShoppingContext';
import { useLocalePath } from '../hooks/useLocalePath';
import { interpolate, useTranslation } from '../hooks/useTranslation';
import { collectStores, filterItems, groupByPriority, sortByPriority } from '../lib/shopping';
import {
  createEmptyFilters,
  type Filters as FiltersState,
  type Item,
  type ItemInput,
} from '../types';

export function ListDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { lists, items, loading, addItem, updateItem, deleteItem, markAsPurchased } = useShopping();
  const path = useLocalePath();

  const [filters, setFilters] = useState<FiltersState>(createEmptyFilters);
  const [editing, setEditing] = useState<Item | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);

  const list = lists.find((candidate) => candidate.id === id);
  const listItems = useMemo(() => items.filter((item) => item.listId === id), [items, id]);
  const stores = useMemo(() => collectStores(listItems), [listItems]);

  const visible = useMemo(() => {
    const scoped = filterItems(listItems, { ...filters, listId: 'all' });
    return sortByPriority(scoped);
  }, [listItems, filters]);

  const groups = useMemo(() => groupByPriority(visible), [visible]);

  if (!list && !loading) {
    return (
      <div className="layout">
        <Header />
        <main className="main" id="main-content">
          <p className="empty-state">{t.detail.notFound}</p>
          <Link className="btn btn--primary" to={path('/listas')}>
            {t.detail.backToLists}
          </Link>
        </main>
      </div>
    );
  }

  const handleSubmit = (input: ItemInput) => {
    if (editing && editing !== 'new') {
      updateItem(editing.id, input);
    } else {
      addItem(input);
    }
    setEditing(null);
  };

  return (
    <div className="layout">
      <Header />
      <main className="main" id="main-content">
        {loading || !list ? (
          <p className="empty-state" role="status">
            {t.common.loading}
          </p>
        ) : (
          <>
            <div className="page-header">
              <div>
                <p className="breadcrumb">
                  <Link to={path('/listas')}>{t.nav.lists}</Link>
                </p>
                <h1>{list.name}</h1>
              </div>
              <button type="button" className="btn btn--primary" onClick={() => setEditing('new')}>
                {t.item.newItem}
              </button>
            </div>

            <Filters
              filters={filters}
              onChange={setFilters}
              lists={lists}
              stores={stores}
              showList={false}
              resultCount={visible.length}
            />

            {listItems.length === 0 ? (
              <p className="empty-state">{t.detail.empty}</p>
            ) : visible.length === 0 ? (
              <p className="empty-state">{t.detail.emptyFiltered}</p>
            ) : (
              groups.map((group) => (
                <section
                  key={group.priority}
                  className="group"
                  aria-labelledby={`group-${group.priority}`}
                >
                  <h2 id={`group-${group.priority}`} className="group__title">
                    {t.priority[group.priority]}
                    <span className="group__count">{group.items.length}</span>
                  </h2>
                  <ul className="item-list">
                    {group.items.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        onEdit={() => setEditing(item)}
                        onDelete={() => setDeleting(item)}
                        onMarkPurchased={() => markAsPurchased(item.id)}
                      />
                    ))}
                  </ul>
                </section>
              ))
            )}
          </>
        )}
      </main>

      {editing && list && (
        <Modal
          title={editing === 'new' ? t.item.newItem : t.item.editItem}
          onClose={() => setEditing(null)}
        >
          <ItemForm
            lists={lists}
            defaultListId={list.id}
            item={editing === 'new' ? undefined : editing}
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
