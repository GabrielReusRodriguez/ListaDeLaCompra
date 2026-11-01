import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog, ListCard, Modal, NameForm } from '../components';
import { Header } from '../components/Header';
import { useShopping } from '../context/ShoppingContext';
import { useLocalePath } from '../hooks/useLocalePath';
import { interpolate, useTranslation } from '../hooks/useTranslation';
import type { ShoppingList } from '../types';

type Dialog =
  | { kind: 'create' }
  | { kind: 'rename'; list: ShoppingList }
  | { kind: 'delete'; list: ShoppingList }
  | null;

export function ListsPage() {
  const { t } = useTranslation();
  const { lists, items, loading, addList, renameList, deleteList } = useShopping();
  const path = useLocalePath();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<Dialog>(null);

  const sortedLists = [...lists].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="layout">
      <Header />
      <main className="main" id="main-content">
        <div className="page-header">
          <h1>{t.lists.title}</h1>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setDialog({ kind: 'create' })}
          >
            {t.lists.newList}
          </button>
        </div>

        {loading ? (
          <p className="empty-state" role="status">
            {t.common.loading}
          </p>
        ) : sortedLists.length === 0 ? (
          <p className="empty-state">{t.lists.empty}</p>
        ) : (
          <div className="grid grid--cards">
            {sortedLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                pendingCount={items.filter((item) => item.listId === list.id).length}
                onOpen={() => navigate(path(`/lista/${list.id}`))}
                onRename={() => setDialog({ kind: 'rename', list })}
                onDelete={() => setDialog({ kind: 'delete', list })}
              />
            ))}
          </div>
        )}
      </main>

      {dialog?.kind === 'create' && (
        <Modal title={t.lists.newList} onClose={() => setDialog(null)}>
          <NameForm
            label={t.lists.listName}
            submitLabel={t.common.add}
            onSubmit={(name) => {
              const list = addList(name);
              setDialog(null);
              if (list) navigate(path(`/lista/${list.id}`));
            }}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}

      {dialog?.kind === 'rename' && (
        <Modal title={t.lists.rename} onClose={() => setDialog(null)}>
          <NameForm
            label={t.lists.listName}
            initialValue={dialog.list.name}
            onSubmit={(name) => {
              renameList(dialog.list.id, name);
              setDialog(null);
            }}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}

      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title={t.lists.deleteTitle}
          message={interpolate(t.lists.deleteConfirm, { name: dialog.list.name })}
          onConfirm={() => {
            deleteList(dialog.list.id);
            setDialog(null);
          }}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
}
